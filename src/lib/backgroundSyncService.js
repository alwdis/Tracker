// Фоновый сервис синхронизации для проверки обновлений
// Работает в фоне даже когда приложение свернуто

class BackgroundSyncService {
  constructor() {
    this.isRunning = false;
    this.syncInterval = null;
    this.lastSyncTime = null;
    this.settings = this.loadSettings();
    this.notificationService = null; // Будет установлен извне
  }

  // Загрузка настроек фоновой синхронизации
  loadSettings() {
    try {
      const saved = localStorage.getItem('background-sync-settings');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        syncInterval: 15 * 60 * 1000, // 15 минут по умолчанию
        checkOnStartup: true,
        checkWhenOnline: true,
        maxRetries: 3,
        retryDelay: 30 * 1000 // 30 секунд
      };
    } catch (e) {
      console.error('Error loading background sync settings:', e);
      return {
        enabled: true,
        syncInterval: 15 * 60 * 1000,
        checkOnStartup: true,
        checkWhenOnline: true,
        maxRetries: 3,
        retryDelay: 30 * 1000
      };
    }
  }

  // Сохранение настроек
  saveSettings() {
    try {
      localStorage.setItem('background-sync-settings', JSON.stringify(this.settings));
    } catch (e) {
      console.error('Error saving background sync settings:', e);
    }
  }

  // Обновление настроек
  updateSettings(newSettings, mediaItems = null) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Перезапуск сервиса если изменился интервал
    if (this.isRunning && mediaItems) {
      this.stop();
      this.start(mediaItems);
    }
  }

  // Установка ссылки на сервис уведомлений
  setNotificationService(notificationService) {
    this.notificationService = notificationService;
  }

  // Проверка подключения к интернету
  isOnline() {
    return navigator.onLine;
  }

  // Основная функция синхронизации
  async performSync(mediaItems, retryCount = 0) {
    if (!this.settings.enabled) {
      console.log('Background sync disabled');
      return;
    }

    if (!this.isOnline()) {
      console.log('No internet connection, skipping sync');
      return;
    }

    if (!this.notificationService) {
      console.warn('Notification service not available');
      return;
    }

    // Проверяем, что mediaItems является массивом
    if (!Array.isArray(mediaItems)) {
      console.error('mediaItems must be an array');
      return;
    }

    try {
      console.log('Background sync started...');
      this.lastSyncTime = new Date();
      
      // Выполняем проверку обновлений через сервис уведомлений
      await this.notificationService.checkForUpdates(mediaItems);
      
      console.log('Background sync completed successfully');
      
      // Сохраняем время последней успешной синхронизации
      localStorage.setItem('last-sync-time', this.lastSyncTime.toISOString());
      
    } catch (error) {
      console.error('Background sync failed:', error);
      
      // Повторная попытка при ошибке
      if (retryCount < this.settings.maxRetries) {
        console.log(`Retrying sync in ${this.settings.retryDelay / 1000} seconds... (attempt ${retryCount + 1}/${this.settings.maxRetries})`);
        setTimeout(() => {
          this.performSync(mediaItems, retryCount + 1);
        }, this.settings.retryDelay);
      } else {
        console.error('Max retries reached, giving up');
      }
    }
  }

  // Запуск фоновой синхронизации
  start(mediaItems) {
    if (this.isRunning) {
      console.log('Background sync already running');
      return;
    }

    this.isRunning = true;
    console.log('Background sync service started');

    // Первая синхронизация при запуске
    if (this.settings.checkOnStartup) {
      this.performSync(mediaItems);
    }

    // Устанавливаем интервал для периодической синхронизации
    this.syncInterval = setInterval(() => {
      this.performSync(mediaItems);
    }, this.settings.syncInterval);

    // Слушаем события изменения состояния сети
    window.addEventListener('online', () => {
      if (this.settings.checkWhenOnline) {
        console.log('Connection restored, performing sync...');
        this.performSync(mediaItems);
      }
    });

    // Слушаем события видимости страницы (когда пользователь возвращается к приложению)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.settings.enabled) {
        // Проверяем, прошло ли достаточно времени с последней синхронизации
        const lastSync = localStorage.getItem('last-sync-time');
        if (lastSync) {
          const timeSinceLastSync = Date.now() - new Date(lastSync).getTime();
          const minInterval = Math.min(this.settings.syncInterval, 5 * 60 * 1000); // Не чаще чем раз в 5 минут
          
          if (timeSinceLastSync > minInterval) {
            console.log('App became visible, performing sync...');
            this.performSync(mediaItems);
          }
        }
      }
    });
  }

  // Остановка фоновой синхронизации
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('Background sync service stopped');
  }

  // Ручная синхронизация
  async manualSync(mediaItems) {
    console.log('Manual background sync triggered');
    await this.performSync(mediaItems);
  }

  // Получение статистики
  getStats() {
    return {
      isRunning: this.isRunning,
      syncInterval: this.settings.syncInterval,
      lastSyncTime: this.lastSyncTime,
      settings: this.settings,
      isOnline: this.isOnline()
    };
  }

  // Очистка истории синхронизации
  clearSyncHistory() {
    localStorage.removeItem('last-sync-time');
    this.lastSyncTime = null;
    console.log('Sync history cleared');
  }

  // Проверка необходимости синхронизации
  shouldSync() {
    if (!this.settings.enabled) return false;
    if (!this.isOnline()) return false;
    
    const lastSync = localStorage.getItem('last-sync-time');
    if (!lastSync) return true;
    
    const timeSinceLastSync = Date.now() - new Date(lastSync).getTime();
    return timeSinceLastSync > this.settings.syncInterval;
  }
}

// Создаем единственный экземпляр сервиса
export const backgroundSyncService = new BackgroundSyncService();

// Экспортируем класс для тестирования
export { BackgroundSyncService };
