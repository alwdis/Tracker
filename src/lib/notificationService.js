// Сервис для отслеживания новых эпизодов и глав через Shikimori API
// Поддерживает push-уведомления для аниме и манги

class NotificationService {
  constructor() {
    this.checkInterval = null;
    this.isRunning = false;
    this.lastCheckTimes = new Map(); // Хранение времени последней проверки для каждого тайтла
    this.notificationSettings = this.loadSettings();
  }

  // Загрузка настроек уведомлений
  loadSettings() {
    try {
      const saved = localStorage.getItem('notification-settings');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        checkInterval: 30 * 60 * 1000, // 30 минут по умолчанию
        animeEnabled: true,
        mangaEnabled: true,
        onlyWatching: true, // Уведомления только для статуса "watching"
        soundEnabled: true,
        desktopEnabled: true
      };
    } catch (e) {
      console.error('Error loading notification settings:', e);
      return {
        enabled: true,
        checkInterval: 30 * 60 * 1000,
        animeEnabled: true,
        mangaEnabled: true,
        onlyWatching: true,
        soundEnabled: true,
        desktopEnabled: true
      };
    }
  }

  // Сохранение настроек
  saveSettings() {
    try {
      localStorage.setItem('notification-settings', JSON.stringify(this.notificationSettings));
    } catch (e) {
      console.error('Error saving notification settings:', e);
    }
  }

  // Обновление настроек
  updateSettings(newSettings, mediaItems = null) {
    this.notificationSettings = { ...this.notificationSettings, ...newSettings };
    this.saveSettings();
    
    // Перезапуск сервиса если изменился интервал
    if (this.isRunning && mediaItems) {
      this.stop();
      this.start(mediaItems);
    }
  }

  // Получение информации о тайтле из Shikimori API
  async fetchTitleInfo(shikimoriId, type) {
    try {
      const endpoint = type === 'anime' ? 'animes' : 'mangas';
      const response = await fetch(`https://shikimori.one/api/${endpoint}/${shikimoriId}`, {
        headers: { Accept: 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Добавляем задержку для соблюдения лимитов API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: data.id,
        title: data.russian || data.name,
        episodes: data.episodes || data.chapters,
        status: data.status,
        aired_on: data.aired_on,
        released_on: data.released_on,
        type: type
      };
    } catch (error) {
      console.error(`Error fetching ${type} info for ID ${shikimoriId}:`, error);
      return null;
    }
  }

  // Проверка обновлений для одного тайтла
  async checkTitleUpdates(mediaItem) {
    // Проверяем только тайтлы из Shikimori
    if (!mediaItem.source || mediaItem.source !== 'shikimori') {
      return null;
    }

    // Проверяем настройки
    if (this.notificationSettings.onlyWatching && mediaItem.status !== 'watching') {
      return null;
    }

    if (mediaItem.type === 'anime' && !this.notificationSettings.animeEnabled) {
      return null;
    }

    if (mediaItem.type === 'manga' && !this.notificationSettings.mangaEnabled) {
      return null;
    }

    // Получаем текущую информацию о тайтле
    const currentInfo = await this.fetchTitleInfo(mediaItem.id, mediaItem.type);
    if (!currentInfo) {
      return null;
    }

    // Проверяем, есть ли изменения
    const lastCheck = this.lastCheckTimes.get(mediaItem.id);
    const currentEpisodes = currentInfo.episodes;
    const storedEpisodes = mediaItem.totalEpisodes || 0;

    // Если количество эпизодов увеличилось
    if (currentEpisodes && currentEpisodes > storedEpisodes) {
      const newEpisodes = currentEpisodes - storedEpisodes;
      
      // Обновляем время последней проверки
      this.lastCheckTimes.set(mediaItem.id, Date.now());
      
      return {
        mediaItem,
        newEpisodes,
        currentEpisodes,
        previousEpisodes: storedEpisodes,
        title: currentInfo.title,
        type: mediaItem.type
      };
    }

    // Обновляем время последней проверки даже если изменений нет
    this.lastCheckTimes.set(mediaItem.id, Date.now());
    
    return null;
  }

  // Отправка уведомления
  async sendNotification(updateInfo) {
    if (!this.notificationSettings.enabled) {
      return;
    }

    const { mediaItem, newEpisodes, currentEpisodes, title, type } = updateInfo;
    const episodeText = type === 'anime' ? 'серий' : 'глав';
    const episodeTextSingle = type === 'anime' ? 'серия' : 'глава';
    
    const message = newEpisodes === 1 
      ? `Вышла новая ${episodeTextSingle} "${title}"`
      : `Вышло ${newEpisodes} новых ${episodeText} "${title}"`;

    // Системное уведомление (Electron)
    if (this.notificationSettings.desktopEnabled && window.electronAPI) {
      try {
        await window.electronAPI.showNotification({
          title: 'Новый эпизод!',
          body: message,
          icon: mediaItem.imageUrl || undefined
        });
      } catch (error) {
        console.error('Error showing desktop notification:', error);
      }
    }

    // Браузерное уведомление (PWA)
    if (this.notificationSettings.desktopEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const notification = new Notification('Новый эпизод!', {
          body: message,
          icon: mediaItem.imageUrl || '/icon-192.png',
          badge: '/icon-192.png',
          tag: `episode-${mediaItem.id}`,
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    }

    // Звуковое уведомление
    if (this.notificationSettings.soundEnabled) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio notification failed:', e));
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }

    console.log('Notification sent:', message);
  }

  // Основная функция проверки обновлений
  async checkForUpdates(mediaItems) {
    if (!this.notificationSettings.enabled) {
      return;
    }

    // Проверяем, что mediaItems является массивом
    if (!Array.isArray(mediaItems)) {
      console.error('mediaItems must be an array');
      return;
    }

    console.log('Checking for updates...');
    const updates = [];

    // Проверяем каждый тайтл
    for (const mediaItem of mediaItems) {
      try {
        const update = await this.checkTitleUpdates(mediaItem);
        if (update) {
          updates.push(update);
        }
      } catch (error) {
        console.error(`Error checking updates for ${mediaItem.title}:`, error);
      }
    }

    // Отправляем уведомления
    for (const update of updates) {
      await this.sendNotification(update);
    }

    if (updates.length > 0) {
      console.log(`Found ${updates.length} updates`);
    }
  }

  // Запуск автоматической проверки
  start(mediaItems) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log('Notification service started');

    // Первая проверка сразу
    this.checkForUpdates(mediaItems);

    // Устанавливаем интервал
    this.checkInterval = setInterval(() => {
      this.checkForUpdates(mediaItems);
    }, this.notificationSettings.checkInterval);
  }

  // Остановка автоматической проверки
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Notification service stopped');
  }

  // Ручная проверка обновлений
  async manualCheck(mediaItems) {
    console.log('Manual check triggered');
    await this.checkForUpdates(mediaItems);
  }

  // Запрос разрешения на уведомления
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Получение статуса разрешений
  getPermissionStatus() {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  // Очистка истории проверок
  clearCheckHistory() {
    this.lastCheckTimes.clear();
    console.log('Check history cleared');
  }

  // Получение статистики
  getStats() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.notificationSettings.checkInterval,
      lastCheckCount: this.lastCheckTimes.size,
      settings: this.notificationSettings
    };
  }
}

// Создаем единственный экземпляр сервиса
export const notificationService = new NotificationService();

// Экспортируем класс для тестирования
export { NotificationService };
