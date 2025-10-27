/**
 * Сервис для проверки новых эпизодов и отправки уведомлений
 */

/**
 * Проверить, нужно ли отправить уведомление о новом эпизоде
 * @param {Object} item - Элемент медиа из библиотеки пользователя
 * @param {Date} lastCheckTime - Время последней проверки
 * @returns {Object|null} Информация о новом эпизоде или null
 */
export const checkForNewEpisode = async (item, lastCheckTime) => {
  if (!item.tvmazeId) {
    console.log(`No TVMaze ID for ${item.title}`);
    return null;
  }

  try {
    let nextEpisode = null;
    
    // Проверяем через TVMaze (приоритетно для расписания)
    if (item.tvmazeId) {
      try {
        const { getNextEpisode } = await import('./tvmazeService');
        nextEpisode = await getNextEpisode(item.tvmazeId);
      } catch (error) {
        console.error(`Error getting next episode from TVMaze for ${item.title}:`, error);
      }
    }
    
    if (!nextEpisode) return null;
    
    const episodeDate = new Date(nextEpisode.airstamp || nextEpisode.airDate);
    const now = new Date();
    
    // Проверяем, вышел ли эпизод после последней проверки
    if (episodeDate <= now && (!lastCheckTime || episodeDate > lastCheckTime)) {
      return {
        type: 'new_episode',
        showId: item.id,
        showTitle: item.title,
        episode: {
          season: nextEpisode.season || nextEpisode.seasonNumber,
          number: nextEpisode.number || nextEpisode.episodeNumber,
          name: nextEpisode.name,
          aired: episodeDate,
        },
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error checking episode for ${item.title}:`, error);
    return null;
  }
};

/**
 * Проверить все сериалы пользователя на новые эпизоды
 */
export const checkAllShows = async (allItems, lastCheckTime) => {
  const series = allItems.filter(item => 
    item.type === 'series' && 
    (item.status === 'watching' || item.status === 'planned')
  );
  
  const notifications = [];
  
  for (const item of series) {
    try {
      const notification = await checkForNewEpisode(item, lastCheckTime);
      if (notification) {
        notifications.push(notification);
      }
    } catch (error) {
      console.error(`Error checking ${item.title}:`, error);
    }
    
    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return notifications;
};

/**
 * Создать текст уведомления о новом эпизоде
 */
export const createEpisodeNotificationText = (notification) => {
  return {
    title: `🎬 Новый эпизод: ${notification.showTitle}`,
    body: `S${notification.episode.season}E${notification.episode.number}: ${notification.episode.name}`,
    data: {
      type: 'new_episode',
      showId: notification.showId,
      episodeSeason: notification.episode.season,
      episodeNumber: notification.episode.number,
    },
  };
};

/**
 * Периодическая проверка новых эпизодов (можно запускать как background job)
 */
export const startEpisodeCheckService = async (allItems, notificationCallback, intervalMinutes = 60) => {
  // Функция проверки
  const check = async () => {
    const lastCheckTime = new Date(Date.now() - intervalMinutes * 60 * 1000);
    const notifications = await checkAllShows(allItems, lastCheckTime);
    
    if (notifications.length > 0) {
      notifications.forEach(notification => {
        const text = createEpisodeNotificationText(notification);
        notificationCallback(text);
      });
    }
  };
  
  // Проверяем сразу
  await check();
  
  // Затем проверяем каждые intervalMinutes
  setInterval(check, intervalMinutes * 60 * 1000);
};

