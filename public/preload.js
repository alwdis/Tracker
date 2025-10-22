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