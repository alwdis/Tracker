// Electron main with backups + auto-updater
const { app, BrowserWindow, ipcMain, Menu, dialog, globalShortcut } = require('electron');
const path = require('path');
const fsSync = require('fs');
const fs = require('fs').promises;
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('webdav');

// Yandex.Disk WebDAV configuration
let yandexClient = null;
const YANDEX_WEBDAV_URL = 'https://webdav.yandex.ru';

async function initializeYandexDisk(username, password) {
  try {
    yandexClient = createClient(YANDEX_WEBDAV_URL, {
      username: username,
      password: password
    });
    
    // Проверяем подключение
    await yandexClient.getDirectoryContents('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize Yandex.Disk:', error);
    yandexClient = null;
    return { success: false, error: error.message };
  }
}

async function uploadToYandexDisk(filePath, remotePath) {
  try {
    if (!yandexClient) {
      throw new Error('Yandex.Disk client not initialized');
    }
    
    const fileContent = await fs.readFile(filePath);
    await yandexClient.putFileContents(remotePath, fileContent, { overwrite: true });
    
    return { success: true, path: remotePath };
  } catch (error) {
    console.error('Failed to upload to Yandex.Disk:', error);
    return { success: false, error: error.message };
  }
}

async function downloadFromYandexDisk(remotePath, localPath) {
  try {
    if (!yandexClient) {
      throw new Error('Yandex.Disk client not initialized');
    }
    
    const fileContent = await yandexClient.getFileContents(remotePath);
    await fs.writeFile(localPath, fileContent);
    
    return { success: true, path: localPath };
  } catch (error) {
    console.error('Failed to download from Yandex.Disk:', error);
    return { success: false, error: error.message };
  }
}

async function listYandexDiskFiles(remotePath = '/Tracker') {
  try {
    if (!yandexClient) {
      throw new Error('Yandex.Disk client not initialized');
    }
    
    // Создаём папку если её нет
    try {
      await yandexClient.createDirectory(remotePath);
    } catch (e) {
      // Папка уже существует
    }
    
    const contents = await yandexClient.getDirectoryContents(remotePath);
    return { 
      success: true, 
      files: contents.filter(item => item.type === 'file' && item.basename.endsWith('.json'))
    };
  } catch (error) {
    console.error('Failed to list Yandex.Disk files:', error);
    return { success: false, error: error.message, files: [] };
  }
}

// Google Drive API configuration
const GOOGLE_DRIVE_CONFIG = {
  clientId: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000',
  scopes: ['https://www.googleapis.com/auth/drive.file']
};

let oauth2Client = null;
let drive = null;

// Google Drive API functions
async function initializeGoogleDrive() {
  try {
    oauth2Client = new OAuth2Client(
      GOOGLE_DRIVE_CONFIG.clientId,
      GOOGLE_DRIVE_CONFIG.clientSecret,
      GOOGLE_DRIVE_CONFIG.redirectUri
    );
    
    drive = google.drive({ version: 'v3', auth: oauth2Client });
    console.log('Google Drive API initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Google Drive API:', error);
    return false;
  }
}

async function getAuthUrl() {
  if (!oauth2Client) await initializeGoogleDrive();
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_DRIVE_CONFIG.scopes,
  });
  
  return authUrl;
}

async function saveTokens(tokens) {
  try {
    const tokensPath = path.join(app.getPath('userData'), 'google-tokens.json');
    await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));
    console.log('Google tokens saved');
    return true;
  } catch (error) {
    console.error('Failed to save tokens:', error);
    return false;
  }
}

async function loadTokens() {
  try {
    const tokensPath = path.join(app.getPath('userData'), 'google-tokens.json');
    const tokensData = await fs.readFile(tokensPath, 'utf8');
    return JSON.parse(tokensData);
  } catch (error) {
    console.log('No saved tokens found');
    return null;
  }
}

async function uploadToGoogleDrive(filePath, fileName) {
  try {
    if (!drive) await initializeGoogleDrive();
    
    const fileMetadata = {
      name: fileName,
      parents: ['appDataFolder'] // Store in app-specific folder
    };
    
    const media = {
      mimeType: 'application/json',
      body: fsSync.createReadStream(filePath)
    };
    
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name'
    });
    
    console.log('File uploaded to Google Drive:', response.data);
    return { success: true, fileId: response.data.id };
  } catch (error) {
    console.error('Failed to upload to Google Drive:', error);
    return { success: false, error: error.message };
  }
}

async function downloadFromGoogleDrive(fileId, localPath) {
  try {
    if (!drive) await initializeGoogleDrive();
    
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, { responseType: 'stream' });
    
    const writeStream = fsSync.createWriteStream(localPath);
    response.data.pipe(writeStream);
    
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('File downloaded from Google Drive');
        resolve({ success: true });
      });
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error('Failed to download from Google Drive:', error);
    return { success: false, error: error.message };
  }
}

const isDev = process.env.ELECTRON_IS_DEV === 'true' || (!app.isPackaged && process.defaultApp);
console.log('=== APP STARTUP DEBUG ===');
console.log('process.env.ELECTRON_IS_DEV:', process.env.ELECTRON_IS_DEV);
console.log('process.defaultApp:', process.defaultApp);
console.log('isDev:', isDev);
console.log('app.isPackaged:', app.isPackaged);
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('========================');

// --- Auto Updater (GitHub Releases via electron-updater) ---
let autoUpdater;
try {
  autoUpdater = require('electron-updater').autoUpdater;
  console.log('electron-updater loaded successfully');
} catch (e) {
  console.warn('electron-updater not installed yet. Skipping auto updates.');
  console.warn('Error:', e.message);
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
      webSecurity: false, // consider true and fix CORS per-host
      cache: !isDev // Отключаем кэш в dev режиме
    },
    frame: true, show: false, backgroundColor: '#1a1a1a',
    icon: iconPath
  });
  
  // Очищаем кэш в dev режиме
  if (isDev) {
    mainWindow.webContents.session.clearCache().then(() => {
      console.log('Cache cleared in dev mode');
    });
  }
  
  // Отправляем диагностическую информацию в renderer (без автоматического открытия консоли)
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('debug-info', {
      isDev,
      isPackaged: app.isPackaged,
      electronUpdaterAvailable: !!autoUpdater,
      version: app.getVersion(),
      platform: process.platform
    });
  });
  
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  Menu.setApplicationMenu(null);
  
  // Регистрируем горячие клавиши для отладки
  registerDebugShortcuts();

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

// Функция для регистрации горячих клавиш отладки
function registerDebugShortcuts() {
  // Ctrl+Shift+I - открыть/закрыть консоль разработчика
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
        console.log('DevTools closed');
      } else {
        mainWindow.webContents.openDevTools();
        console.log('DevTools opened');
      }
    }
  });
  
  // Ctrl+Shift+R - перезагрузить приложение
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (mainWindow) {
      mainWindow.reload();
      console.log('Application reloaded');
    }
  });
  
  // Ctrl+Shift+D - показать информацию о приложении
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      const info = {
        version: app.getVersion(),
        platform: process.platform,
        isDev: isDev,
        isPackaged: app.isPackaged
      };
      
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Информация о приложении',
        message: `Tracker v${info.version}`,
        detail: `Платформа: ${info.platform}\nРежим разработки: ${info.isDev ? 'Да' : 'Нет'}\nУпакованное приложение: ${info.isPackaged ? 'Да' : 'Нет'}`,
        buttons: ['OK']
      });
    }
  });
  
  
  console.log('Debug shortcuts registered:');
  console.log('- Ctrl+Shift+I: Toggle DevTools');
  console.log('- Ctrl+Shift+R: Reload application');
  console.log('- Ctrl+Shift+D: Show app info');
}

app.on('ready', async () => {
  createWindow();

  // Init auto-updater using update-electron-app (handles private repos)
  const forceAutoUpdate = process.env.FORCE_AUTO_UPDATE === 'true';
  
  console.log('=== AUTO-UPDATER INIT ===');
  console.log('isDev:', isDev);
  console.log('forceAutoUpdate:', forceAutoUpdate);
  console.log('Repository: alwdis/Tracker (private)');
  console.log('Using update-electron-app for private repo support');
  console.log('========================');
  
  // Отправляем информацию о статусе автообновления в renderer
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('auto-updater-status', {
      isDev,
      forceAutoUpdate,
      autoUpdaterAvailable: true,
      shouldInitialize: !isDev || forceAutoUpdate,
        repository: 'alwdis/Tracker (public)'
    });
  }
  
  if ((!isDev || forceAutoUpdate) && autoUpdater) {
    try {
      console.log('Initializing auto-updater with electron-updater...');
      console.log('Repository: alwdis/Tracker (private)');
      
      // Optional: use app.setAppUserModelId for Windows toast notifications
      if (process.platform === 'win32') {
        app.setAppUserModelId('com.alwdis.tracker');
      }

      autoUpdater.autoDownload = true;
      autoUpdater.logger = require('electron-log');
      autoUpdater.logger.transports.file.level = 'info';
      
      // Для публичного репозитория используем стандартную конфигурацию
      console.log('Configuring for public repository...');
      
      // Используем стандартную конфигурацию для публичного репозитория
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'alwdis',
        repo: 'Tracker'
      });
      
      console.log('GitHub API configuration set for public repository');

      autoUpdater.on('error', (e) => {
        console.error('AutoUpdater error:', e);
        console.error('Error details:', e.message, e.stack);
        
        // Если ошибка связана с доступом к репозиторию, показываем информативное сообщение
        if (e.message && e.message.includes('404')) {
          console.log('🔒 Repository access issue detected');
          console.log('💡 Make sure the repository is public and releases are available');
        }
        
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('auto-updater-event', { 
            type: 'error', 
            error: e.message,
            suggestion: e.message.includes('404') ? 'Repository access issue - check if repository is public' : null
          });
        }
      });
      
      autoUpdater.on('update-available', (info) => {
        console.log('✅ Update available:', info.version);
        console.log('Update info:', JSON.stringify(info, null, 2));
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('auto-updater-event', { type: 'update-available', version: info.version });
        }
      });
      
      autoUpdater.on('update-not-available', (info) => {
        console.log('ℹ️ No updates available:', info.version);
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('auto-updater-event', { type: 'update-not-available', version: info.version });
        }
      });
      
      autoUpdater.on('download-progress', (p) => {
        console.log('📥 Download progress:', p.percent + '%');
        mainWindow?.setProgressBar(p.percent / 100);
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('auto-updater-event', { type: 'download-progress', percent: p.percent });
        }
      });
      
      autoUpdater.on('update-downloaded', async (info) => {
        console.log('✅ Update downloaded:', info.version);
        mainWindow?.setProgressBar(-1);
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('auto-updater-event', { type: 'update-downloaded', version: info.version });
        }
        
        const res = await dialog.showMessageBox(mainWindow, {
          type: 'info',
          buttons: ['Перезапустить', 'Позже'],
          defaultId: 0,
          cancelId: 1,
          title: 'Обновление готово',
          message: `Версия ${info.version} загружена`,
          detail: 'Перезапустить приложение для установки обновления?'
        });
        
        if (res.response === 0) {
          setImmediate(() => autoUpdater.quitAndInstall());
        }
      });

      console.log('✅ Auto-updater configured successfully');
      console.log('Current version:', app.getVersion());
      console.log('Feed URL:', autoUpdater.getFeedURL());
      
      // Отправляем событие об успешной инициализации
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('auto-updater-event', { 
          type: 'initialized', 
                message: 'Auto-updater initialized with electron-updater',
                repository: 'alwdis/Tracker (public)',
          currentVersion: app.getVersion()
        });
      }
      
      // Проверяем обновления сразу
      console.log('🔍 Checking for updates...');
      autoUpdater.checkForUpdates().catch(console.error);
      
    } catch (e) {
      console.error('❌ Failed to initialize auto-updater:', e);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('auto-updater-event', { type: 'error', error: e.message });
      }
    }
  } else if (isDev && !forceAutoUpdate) {
    console.log('Auto-updater disabled in development mode');
    console.log('To enable in dev mode, set FORCE_AUTO_UPDATE=true');
  } else if (!autoUpdater) {
    console.log('electron-updater not available');
    console.log('Check if electron-updater is installed in package.json');
  } else {
    console.log('Auto-updater not initialized for unknown reason');
    console.log('isDev:', isDev, 'forceAutoUpdate:', forceAutoUpdate, 'autoUpdater:', !!autoUpdater);
  }
});

// ===== Manual update check =====
ipcMain.handle('manual-check-updates', async () => {
  if (autoUpdater) {
    console.log('Manual update check requested...');
    try {
      const result = await autoUpdater.checkForUpdates();
      console.log('Manual check result:', result);
      return result;
    } catch (error) {
      console.error('Manual check failed:', error);
      throw error;
    }
  } else {
    throw new Error('Auto-updater not available');
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
    
    // Auto-sync to cloud if enabled
    try {
      const settings = await fs.readFile(path.join(app.getPath('userData'), 'cloud-sync-settings.json'), 'utf8').catch(() => '{"autoSync":true}');
      const { autoSync } = JSON.parse(settings);
      
      if (autoSync) {
        const tokens = await loadTokens();
        if (tokens) {
          console.log('Auto-syncing to cloud...');
          // Don't await this to avoid blocking the UI
          syncToCloud().catch(error => console.error('Auto-sync failed:', error));
        }
      }
    } catch (syncError) {
      console.warn('Auto-sync check failed:', syncError);
    }
    
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

// Yandex.Disk WebDAV handlers
ipcMain.handle('connect-to-yandex-disk', async (event, username, password) => {
  try {
    const result = await initializeYandexDisk(username, password);
    
    if (result.success) {
      // Сохраняем credentials (зашифрованно в реальном приложении!)
      const credentialsPath = path.join(app.getPath('userData'), 'yandex-credentials.json');
      await fs.writeFile(credentialsPath, JSON.stringify({ username, password }));
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('disconnect-from-yandex-disk', async () => {
  try {
    yandexClient = null;
    const credentialsPath = path.join(app.getPath('userData'), 'yandex-credentials.json');
    
    if (fsSync.existsSync(credentialsPath)) {
      await fs.unlink(credentialsPath);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-yandex-disk-connection', async () => {
  try {
    const credentialsPath = path.join(app.getPath('userData'), 'yandex-credentials.json');
    
    if (fsSync.existsSync(credentialsPath)) {
      const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));
      const result = await initializeYandexDisk(credentials.username, credentials.password);
      return { connected: result.success, username: credentials.username };
    }
    
    return { connected: false };
  } catch (error) {
    return { connected: false, error: error.message };
  }
});

ipcMain.handle('sync-to-yandex-disk', async () => {
  try {
    if (!yandexClient) {
      // Пробуем восстановить подключение
      const checkResult = await ipcMain.emit('check-yandex-disk-connection');
      if (!yandexClient) {
        throw new Error('Yandex.Disk not connected');
      }
    }
    
    // Создаём бэкап
    const dataPath = path.join(app.getPath('userData'), 'tracker-data.json');
    const backupFileName = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    const remotePath = `/Tracker/${backupFileName}`;
    
    // Загружаем в Яндекс.Диск
    const uploadResult = await uploadToYandexDisk(dataPath, remotePath);
    
    if (uploadResult.success) {
      return {
        success: true,
        message: 'Данные успешно сохранены в Яндекс.Диск'
      };
    } else {
      throw new Error(uploadResult.error);
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sync-from-yandex-disk', async () => {
  try {
    if (!yandexClient) {
      throw new Error('Yandex.Disk not connected');
    }
    
    // Получаем список файлов
    const listResult = await listYandexDiskFiles('/Tracker');
    
    if (!listResult.success || listResult.files.length === 0) {
      throw new Error('No backups found in Yandex.Disk');
    }
    
    // Сортируем по дате изменения (новые первые)
    const latestFile = listResult.files.sort((a, b) => 
      new Date(b.lastmod) - new Date(a.lastmod)
    )[0];
    
    // Скачиваем последний бэкап
    const tempPath = path.join(app.getPath('temp'), latestFile.basename);
    const downloadResult = await downloadFromYandexDisk(latestFile.filename, tempPath);
    
    if (downloadResult.success) {
      // Восстанавливаем данные
      const dataPath = path.join(app.getPath('userData'), 'tracker-data.json');
      await fs.copyFile(tempPath, dataPath);
      await fs.unlink(tempPath);
      
      return {
        success: true,
        message: 'Данные успешно восстановлены из Яндекс.Диска'
      };
    } else {
      throw new Error(downloadResult.error);
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Google Drive API handlers
ipcMain.handle('check-google-drive-connection', async () => {
  try {
    // Проверяем, настроен ли Google Drive API
    if (GOOGLE_DRIVE_CONFIG.clientId === 'YOUR_GOOGLE_CLIENT_ID') {
      return { 
        connected: false, 
        error: 'Google Drive API не настроен. См. инструкцию в GOOGLE_DRIVE_SETUP.md',
        needsSetup: true
      };
    }
    
    const tokens = await loadTokens();
    if (!tokens) {
      return { connected: false, needsAuth: true };
    }
    
    oauth2Client.setCredentials(tokens);
    
    // Test the connection by getting user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    return { 
      connected: true, 
      user: userInfo.data,
      lastSync: tokens.lastSync || null
    };
  } catch (error) {
    console.error('Google Drive connection check failed:', error);
    return { 
      connected: false, 
      error: error.message,
      needsAuth: error.message.includes('invalid_grant') || error.message.includes('unauthorized')
    };
  }
});

ipcMain.handle('connect-to-google-drive', async () => {
  try {
    // Проверяем, настроен ли Google Drive API
    if (GOOGLE_DRIVE_CONFIG.clientId === 'YOUR_GOOGLE_CLIENT_ID') {
      return { 
        success: false, 
        error: 'Google Drive API не настроен. См. инструкцию в GOOGLE_DRIVE_SETUP.md',
        needsSetup: true
      };
    }
    
    const authUrl = await getAuthUrl();
    
    // Open auth URL in default browser
    const { shell } = require('electron');
    await shell.openExternal(authUrl);
    
    return { 
      success: true, 
      authUrl,
      message: 'Откройте браузер и авторизуйтесь в Google Drive. После авторизации вернитесь в приложение.'
    };
  } catch (error) {
    console.error('Failed to initiate Google Drive connection:', error);
    return { 
      success: false, 
      error: error.message,
      needsSetup: error.message.includes('invalid_client')
    };
  }
});

ipcMain.handle('disconnect-from-google-drive', async () => {
  try {
    const tokensPath = path.join(app.getPath('userData'), 'google-tokens.json');
    if (fsSync.existsSync(tokensPath)) {
      await fs.unlink(tokensPath);
    }
    
    oauth2Client = null;
    drive = null;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to disconnect from Google Drive:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sync-to-cloud', async () => {
  try {
    // Create backup file
    const backupResult = await createManualBackup();
    if (!backupResult.success) {
      return { success: false, error: 'Failed to create backup' };
    }
    
    // Upload to Google Drive
    const uploadResult = await uploadToGoogleDrive(
      backupResult.filePath, 
      `tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    );
    
    if (uploadResult.success) {
      // Update last sync time
      const tokens = await loadTokens();
      if (tokens) {
        tokens.lastSync = new Date().toISOString();
        await saveTokens(tokens);
      }
    }
    
    return uploadResult;
  } catch (error) {
    console.error('Failed to sync to cloud:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sync-from-cloud', async () => {
  try {
    if (!drive) {
      const tokens = await loadTokens();
      if (!tokens) {
        return { success: false, error: 'Not connected to Google Drive' };
      }
      oauth2Client.setCredentials(tokens);
      drive = google.drive({ version: 'v3', auth: oauth2Client });
    }
    
    // List files in app folder
    const response = await drive.files.list({
      q: "parents in 'appDataFolder' and name contains 'tracker-backup'",
      orderBy: 'createdTime desc',
      pageSize: 1
    });
    
    if (response.data.files.length === 0) {
      return { success: false, error: 'No backup files found in cloud' };
    }
    
    const latestFile = response.data.files[0];
    const tempPath = path.join(app.getPath('temp'), latestFile.name);
    
    // Download the latest backup
    const downloadResult = await downloadFromGoogleDrive(latestFile.id, tempPath);
    
    if (downloadResult.success) {
      // Restore from backup
      const restoreResult = await restoreFromBackup(tempPath);
      
      // Clean up temp file
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp file:', cleanupError);
      }
      
      return restoreResult;
    }
    
    return downloadResult;
  } catch (error) {
    console.error('Failed to sync from cloud:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-cloud-sync-settings', async () => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'cloud-sync-settings.json');
    const settingsData = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(settingsData);
  } catch (error) {
    // Return default settings if file doesn't exist
    return { autoSync: true };
  }
});

ipcMain.handle('set-cloud-sync-settings', async (event, settings) => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'cloud-sync-settings.json');
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Failed to save cloud sync settings:', error);
    return { success: false, error: error.message };
  }
});

// macOS lifecycle
app.on('will-quit', () => {
  // Очищаем все горячие клавиши
  globalShortcut.unregisterAll();
  console.log('Debug shortcuts unregistered');
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
