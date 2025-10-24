// Electron main with backups + auto-updater
const { app, BrowserWindow, ipcMain, Menu, dialog, globalShortcut } = require('electron');
const path = require('path');
const fsSync = require('fs');
const fs = require('fs').promises;
// webdav is an ES Module, so we'll load it dynamically

// Load environment variables for production
if (process.env.NODE_ENV === 'production') {
  const envPath = path.join(__dirname, '.env');
  if (fsSync.existsSync(envPath)) {
    const envContent = fsSync.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}


// Yandex.Disk WebDAV configuration
let yandexClient = null;
const YANDEX_WEBDAV_URL = 'https://webdav.yandex.ru';

// Dynamic import for webdav ES Module
async function loadWebDAV() {
  try {
    // В упакованном приложении используем другой подход
    if (app.isPackaged) {
      // Для упакованного приложения используем require с try-catch
      try {
        const webdav = require('webdav');
        return webdav.createClient;
      } catch (requireError) {
        console.warn('Failed to require webdav, trying dynamic import:', requireError.message);
        const { createClient } = await import('webdav');
        return createClient;
      }
    } else {
      // В dev режиме используем динамический импорт
      const { createClient } = await import('webdav');
      return createClient;
    }
  } catch (error) {
    console.error('Failed to load webdav:', error);
    throw error;
  }
}

async function initializeYandexDisk(username, password) {
  try {
    const createClient = await loadWebDAV();
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
    iconPath = path.join(__dirname, '../assets/icons/icon.ico');
  } else {
    // В production проверяем несколько возможных путей
    const possiblePaths = [
      path.join(__dirname, 'assets/icons/icon.ico'),
      path.join(__dirname, '../assets/icons/icon.ico'),
      path.join(process.resourcesPath, 'assets/icons/icon.ico'),
      path.join(process.resourcesPath, 'app.asar.unpacked/assets/icons/icon.ico'),
      path.join(app.getAppPath(), 'assets/icons/icon.ico'),
      // Fallback to PNG if ICO not found
      path.join(__dirname, 'assets/icon-256.png'),
      path.join(__dirname, '../assets/icon-256.png'),
      path.join(process.resourcesPath, 'assets/icon-256.png'),
      path.join(process.resourcesPath, 'app.asar.unpacked/assets/icon-256.png'),
      path.join(app.getAppPath(), 'assets/icon-256.png')
    ];
    
    iconPath = possiblePaths.find(p => fsSync.existsSync(p));
    if (!iconPath) {
      console.warn('Icon file not found, using default Electron icon');
      console.warn('Checked paths:', possiblePaths);
      iconPath = undefined; // Используем иконку по умолчанию
    } else {
      console.log('Found icon at:', iconPath);
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
  
  // Добавляем обработчик ошибок в renderer процесс
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Renderer failed to load:', errorCode, errorDescription, validatedURL);
    showErrorPage(new Error(`Failed to load: ${errorDescription}`));
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer finished loading');
    // Проверяем, что React приложение загрузилось
    mainWindow.webContents.executeJavaScript(`
      // Проверяем, что React приложение загрузилось
      setTimeout(() => {
        const root = document.getElementById('root');
        const loading = document.getElementById('pwa-loading');
        
        if (root && root.children.length === 0 && loading) {
          console.error('React app did not load properly');
          loading.innerHTML = '<div style="text-align: center; padding: 20px;"><h3>Ошибка загрузки приложения</h3><p>React приложение не загрузилось</p><button onclick="window.location.reload()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Перезагрузить</button></div>';
        }
      }, 2000);
    `).catch(err => console.error('Failed to execute JavaScript:', err));
  });
  
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
  console.log('=== URL LOADING DEBUG ===');
  console.log('isDev:', isDev);
  console.log('startUrl:', startUrl);
  console.log('__dirname:', __dirname);
  console.log('index.html path:', path.join(__dirname, 'index.html'));
  console.log('index.html exists:', fsSync.existsSync(path.join(__dirname, 'index.html')));
  
  // Дополнительная проверка для упакованного приложения
  if (!isDev) {
    const possibleIndexPaths = [
      path.join(__dirname, 'index.html'),
      path.join(process.resourcesPath, 'app.asar', 'index.html'),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'index.html'),
      path.join(app.getAppPath(), 'index.html')
    ];
    
    console.log('Checking possible index.html paths:');
    possibleIndexPaths.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p} - exists: ${fsSync.existsSync(p)}`);
    });
    
    // Находим существующий путь
    const existingPath = possibleIndexPaths.find(p => fsSync.existsSync(p));
    if (existingPath) {
      const correctedUrl = `file://${existingPath}`;
      console.log('Using corrected URL:', correctedUrl);
      mainWindow.loadURL(correctedUrl).catch(err => {
        console.error('Failed to load corrected URL:', err);
        showErrorPage(err);
      });
    } else {
      console.error('No index.html found in any expected location');
      showErrorPage(new Error('index.html not found'));
    }
  } else {
    mainWindow.loadURL(startUrl).catch(err => {
      console.error('Failed to load URL:', err);
      showErrorPage(err);
    });
  }
  
  function showErrorPage(err) {
    mainWindow.loadURL(`data:text/html;charset=utf-8,
      <html><body style="background:#1a1a1a;color:white;font-family:system-ui;padding:24px">
        <h2>Не удалось загрузить приложение</h2>
        <pre>${String(err).replace(/</g,'&lt;')}</pre>
        <p>Попробуйте перезапустить приложение</p>
        <p>Если проблема повторяется, обратитесь к разработчику</p>
      </body></html>`);
  }
  
  console.log('========================');
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
        message: `Media Tracker v${info.version}`,
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

      autoUpdater.autoDownload = false;
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
  if (autoUpdater) {
    console.log('Manual update check requested...');
    try {
      await autoUpdater.checkForUpdates();
      // Результат будет отправлен через события auto-updater-event
      return { success: true };
    } catch (error) {
      console.error('Manual check failed:', error);
      throw error;
    }
  } else {
    throw new Error('Auto-updater not available');
  }
});

// ===== Download update =====
ipcMain.handle('download-update', async () => {
  if (autoUpdater) {
    console.log('Manual download update requested...');
    try {
      // Проверяем, есть ли доступное обновление
      const result = await autoUpdater.checkForUpdates();
      if (result && result.updateInfo) {
        console.log('Update available, starting download...');
        // Запускаем загрузку вручную
        await autoUpdater.downloadUpdate();
        return { success: true, message: 'Download started' };
      } else {
        return { success: false, error: 'No update available' };
      }
    } catch (error) {
      console.error('Download update failed:', error);
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'Auto-updater not available' };
  }
});

// ===== Install update =====
ipcMain.handle('install-update', async () => {
  if (autoUpdater) {
    console.log('Manual install update requested...');
    try {
      // Проверяем, загружено ли обновление
      if (autoUpdater.downloadedUpdateInfo) {
        console.log('Installing update...');
        autoUpdater.quitAndInstall();
        return { success: true, message: 'Installation started' };
      } else {
        return { success: false, error: 'No downloaded update available' };
      }
    } catch (error) {
      console.error('Install update failed:', error);
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'Auto-updater not available' };
  }
});

// ===== Data & Backups =====
const os = require('os');
const desktopDir = path.join(os.homedir(), 'Desktop');
const userDataDir = () => {
  try {
    return app.getPath('userData');
  } catch (error) {
    // Fallback если app еще не готов
    const os = require('os');
    return path.join(os.homedir(), 'AppData', 'Roaming', 'tracker');
  }
};
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
    console.log('createManualBackup: Starting...');
    await ensureUserDataDir();
    
    // Создаем папку Backup внутри userData директории
    const userDataPath = userDataDir();
    const backupDir = path.join(userDataPath, 'Backup');
    console.log('createManualBackup: UserData dir:', userDataPath);
    console.log('createManualBackup: Backup dir:', backupDir);
    
    if (!fsSync.existsSync(backupDir)) {
      console.log('createManualBackup: Creating backup directory:', backupDir);
      await fs.mkdir(backupDir, { recursive: true });
    } else {
      console.log('createManualBackup: Backup directory already exists:', backupDir);
    }
    
    const src = dataFile();
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}__${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`;
    let data = [];
    if (fsSync.existsSync(src)) data = JSON.parse(await fs.readFile(src, 'utf8'));
    const fileName = `tracker-backup-${stamp}.json`;
    // Сохраняем в папку Backup
    const dest = path.join(backupDir, fileName);
    console.log('createManualBackup: Saving backup to:', dest);
    await fs.writeFile(dest, JSON.stringify(data, null, 2), 'utf8');
    console.log('createManualBackup: Backup saved successfully');
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
    console.log('getAvailableBackups: Starting search...');
    const candidates = [];
    // Ищем в папке Backup внутри userData директории
    const userDataPath = userDataDir();
    const backupDir = path.join(userDataPath, 'Backup');
    console.log('getAvailableBackups: UserData dir:', userDataPath);
    console.log('getAvailableBackups: Backup dir:', backupDir);
    
    // Также проверяем старые места для совместимости
    const searchDirs = [backupDir, path.join(userDataPath, 'Backup'), app.getPath('desktop'), userDataPath];
    console.log('getAvailableBackups: Search directories:', searchDirs);
    
    for (const dir of searchDirs) {
      try {
        console.log('getAvailableBackups: Checking directory:', dir);
        if (!fsSync.existsSync(dir)) {
          console.log('getAvailableBackups: Directory does not exist:', dir);
          continue;
        }
        const files = await fs.readdir(dir);
        console.log('getAvailableBackups: Files in', dir, ':', files);
        for (const f of files) {
          if (/tracker-backup-.*\\.json$/i.test(f)) {
            const p = path.join(dir, f);
            const stat = await fs.stat(p);
            let itemCount = 0;
            try { itemCount = JSON.parse(fsSync.readFileSync(p, 'utf8')).length || 0; } catch {}
            console.log('getAvailableBackups: Found backup:', f, 'at', p);
            candidates.push({ name: f, fileName: f, filePath: p, size: stat.size, date: stat.mtimeMs, itemCount });
          }
        }
      } catch (error) {
        console.log('getAvailableBackups: Error checking directory', dir, ':', error.message);
      }
    }
    console.log('getAvailableBackups: Found candidates:', candidates.length);
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
  // По умолчанию открываем папку userData
  const userDataPath = userDataDir();
  const backupDir = path.join(userDataPath, 'Backup');
  
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Выберите файл бэкапа',
    defaultPath: backupDir,
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });
  if (result.canceled) {
    return { canceled: true };
  }
  return { canceled: false, filePath: result.filePaths[0] };
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
    const backupResult = await createManualBackup();
    if (!backupResult.success) {
      throw new Error(backupResult.error);
    }
    
    const remotePath = `/Tracker/${backupResult.fileName}`;
    
    // Загружаем в Яндекс.Диск
    const uploadResult = await uploadToYandexDisk(backupResult.filePath, remotePath);
    
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
      return { success: false, error: 'No backup files found in cloud' };
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
      const restoreResult = await restoreFromBackup(tempPath);
      
      // Clean up temp file
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp file:', cleanupError);
      }
      
      return restoreResult;
    } else {
      throw new Error(downloadResult.error);
    }
  } catch (error) {
    console.error('Failed to sync from Yandex.Disk:', error);
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

