// Electron main with backups + auto-updater
const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fsSync = require('fs');
const fs = require('fs').promises;
const isDev = process.env.ELECTRON_IS_DEV === 'true' || process.defaultApp;

// --- Auto Updater (GitHub Releases via electron-updater) ---
let autoUpdater;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch (e) {
  console.warn('electron-updater not installed yet. Skipping auto updates.');
}

let mainWindow;

function createWindow() {
  // Определяем путь к иконке
  let iconPath;
  if (isDev) {
    iconPath = path.join(__dirname, '../assets/icon.ico');
  } else {
    // В production проверяем несколько возможных путей
    const possiblePaths = [
      path.join(__dirname, 'assets/icon.ico'),
      path.join(__dirname, '../assets/icon.ico'),
      path.join(process.resourcesPath, 'assets/icon.ico')
    ];
    
    iconPath = possiblePaths.find(p => fsSync.existsSync(p));
    if (!iconPath) {
      console.warn('Icon file not found, using default Electron icon');
      iconPath = undefined; // Используем иконку по умолчанию
    }
  }

  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 1000, minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // consider true and fix CORS per-host
    },
    frame: true, show: false, backgroundColor: '#1a1a1a',
    icon: iconPath
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  Menu.setApplicationMenu(null);

  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'index.html')}`;
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
    mainWindow.loadURL(`data:text/html;charset=utf-8,
      <html><body style="background:#1a1a1a;color:white;font-family:system-ui;padding:24px">
        <h2>Не удалось загрузить приложение</h2>
        <pre>${String(err).replace(/</g,'&lt;')}</pre>
      </body></html>`);
  });
}

app.on('ready', async () => {
  createWindow();

  // Init auto-updater (only in prod with electron-updater installed)
  if (!isDev && autoUpdater) {
    try {
      console.log('Initializing auto-updater...');
      
      // Optional: use app.setAppUserModelId for Windows toast notifications
      if (process.platform === 'win32') {
        app.setAppUserModelId('com.alwdis.tracker');
      }

      autoUpdater.autoDownload = true; // download when update is found
      autoUpdater.logger = require('electron-log');
      autoUpdater.logger.transports.file.level = 'info';

      autoUpdater.on('error', (e) => console.error('AutoUpdater error:', e));
      autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info.version);
      });
      autoUpdater.on('download-progress', (p) => {
        console.log('Download progress:', p.percent);
        mainWindow?.setProgressBar(p.percent / 100);
      });
      autoUpdater.on('update-downloaded', async (info) => {
        console.log('Update downloaded:', info.version);
        mainWindow?.setProgressBar(-1);
        const res = await dialog.showMessageBox(mainWindow, {
          type: 'info',
          buttons: ['Перезапустить', 'Позже'],
          defaultId: 0,
          cancelId: 1,
          title: 'Доступно обновление',
          message: `Доступна новая версия ${info.version}`,
          detail: 'Установить и перезапустить приложение сейчас?'
        });
        if (res.response === 0) {
          setImmediate(() => autoUpdater.quitAndInstall());
        }
      });

      console.log('Checking for updates...');
      autoUpdater.checkForUpdates().catch(console.error);
    } catch (e) {
      console.error('Failed to initialize auto-updater:', e);
    }
  } else if (isDev) {
    console.log('Auto-updater disabled in development mode');
  } else if (!autoUpdater) {
    console.log('electron-updater not available');
  }
});

// ===== Local update.json check (legacy) =====
ipcMain.handle('check-for-updates', async () => {
  try {
    const appPath = app.getAppPath();
    const updateFile = path.join(path.dirname(appPath), 'update.json');
    if (fsSync.existsSync(updateFile)) {
      const updateInfo = JSON.parse(await fs.readFile(updateFile, 'utf8'));
      return updateInfo;
    }
    return null;
  } catch (e) {
    console.error('check-for-updates error:', e);
    return null;
  }
});

// ===== Data & Backups =====
const os = require('os');
const desktopDir = path.join(os.homedir(), 'Desktop');
const userDataDir = () => app.getPath('userData');
const dataFile = () => path.join(userDataDir(), 'media-data.json');

async function ensureUserDataDir() {
  const dir = userDataDir();
  try { await fs.mkdir(dir, { recursive: true }); } catch (_) {}
}

ipcMain.handle('read-media-data', async () => {
  try {
    await ensureUserDataDir();
    const p = dataFile();
    if (!fsSync.existsSync(p)) return [];
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error read-media-data:', e);
    return [];
  }
});

ipcMain.handle('write-media-data', async (event, data) => {
  try {
    await ensureUserDataDir();
    await fs.writeFile(dataFile(), JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error write-media-data:', e);
    return false;
  }
});

async function createManualBackup() {
  try {
    await ensureUserDataDir();
    const src = dataFile();
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}__${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`;
    let data = [];
    if (fsSync.existsSync(src)) data = JSON.parse(await fs.readFile(src, 'utf8'));
    const fileName = `tracker-backup-${stamp}.json`;
    const dest = path.join(desktopDir, fileName);
    await fs.writeFile(dest, JSON.stringify(data, null, 2), 'utf8');
    return { success: true, fileName, filePath: dest, itemCount: Array.isArray(data) ? data.length : 0 };
  } catch (error) {
    console.error('createManualBackup error:', error);
    return { success: false, error: String(error) };
  }
}

async function restoreFromBackup(backupPath) {
  try {
    const raw = await fs.readFile(backupPath, 'utf8');
    const data = JSON.parse(raw);
    await ensureUserDataDir();
    await fs.writeFile(dataFile(), JSON.stringify(data, null, 2), 'utf8');
    return { success: true, itemCount: Array.isArray(data) ? data.length : 0 };
  } catch (error) {
    console.error('restoreFromBackup error:', error);
    return { success: false, error: String(error) };
  }
}

async function getAvailableBackups() {
  try {
    const candidates = [];
    for (const dir of [desktopDir, userDataDir()]) {
      try {
        const files = await fs.readdir(dir);
        for (const f of files) {
          if (/tracker-backup-.*\\.json$/i.test(f)) {
            const p = path.join(dir, f);
            const stat = await fs.stat(p);
            let itemCount = 0;
            try { itemCount = JSON.parse(fsSync.readFileSync(p, 'utf8')).length || 0; } catch {}
            candidates.push({ fileName: f, filePath: p, size: stat.size, date: stat.mtimeMs, itemCount });
          }
        }
      } catch (_) {}
    }
    candidates.sort((a, b) => b.date - a.date);
    return candidates;
  } catch (error) {
    console.error('getAvailableBackups error:', error);
    return [];
  }
}

ipcMain.handle('create-manual-backup', async () => createManualBackup());
ipcMain.handle('restore-from-backup', async (event, backupPath) => restoreFromBackup(backupPath));
ipcMain.handle('get-available-backups', async () => getAvailableBackups());
ipcMain.handle('select-backup-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Выберите файл бэкапа',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (result.canceled || !result.filePaths?.length) return null;
  return result.filePaths[0];
});

// macOS lifecycle
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
