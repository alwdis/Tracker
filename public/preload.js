const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readMediaData: () => ipcRenderer.invoke('read-media-data'),
  writeMediaData: (data) => ipcRenderer.invoke('write-media-data', data),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  
  // Backup system APIs
  createManualBackup: () => ipcRenderer.invoke('create-manual-backup'),
  restoreFromBackup: (backupPath) => ipcRenderer.invoke('restore-from-backup', backupPath),
  getAvailableBackups: () => ipcRenderer.invoke('get-available-backups'),
  selectBackupFile: () => ipcRenderer.invoke('select-backup-file')
});

// Обработчик для диагностической информации
ipcRenderer.on('debug-info', (event, data) => {
  console.log('=== ELECTRON DEBUG INFO ===');
  console.log('isDev:', data.isDev);
  console.log('isPackaged:', data.isPackaged);
  console.log('electronUpdaterAvailable:', data.electronUpdaterAvailable);
  console.log('version:', data.version);
  console.log('platform:', data.platform);
  console.log('==========================');
});

// Обработчик для статуса автообновления
ipcRenderer.on('auto-updater-status', (event, data) => {
  console.log('=== AUTO-UPDATER STATUS ===');
  console.log('isDev:', data.isDev);
  console.log('forceAutoUpdate:', data.forceAutoUpdate);
  console.log('autoUpdaterAvailable:', data.autoUpdaterAvailable);
  console.log('shouldInitialize:', data.shouldInitialize);
  console.log('==========================');
});

// Обработчик для событий автообновления
ipcRenderer.on('auto-updater-event', (event, data) => {
  console.log('=== AUTO-UPDATER EVENT ===');
  console.log('Type:', data.type);
  if (data.version) console.log('Version:', data.version);
  if (data.error) console.log('Error:', data.error);
  if (data.percent) console.log('Progress:', data.percent + '%');
  console.log('==========================');
});