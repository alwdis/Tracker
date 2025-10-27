/**
 * TVMaze API Service для получения информации о сериалах и уведомлений о новых эпизодах
 * Документация: https://www.tvmaze.com/api
 */

const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

/**
 * Поиск сериала по названию
 */
export const searchShow = async (query) => {
  try {
    const response = await fetch(`${TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('TVMaze search failed');
    
    const data = await response.json();
    return data.map(item => ({
      id: item.show.id,
      name: item.show.name,
      summary: item.show.summary?.replace(/<[^>]*>/g, '') || '',
      premiered: item.show.premiered,
      ended: item.show.ended,
      genres: item.show.genres || [],
      image: item.show.image?.medium || item.show.image?.original,
      network: item.show.network?.name,
      country: item.show.network?.country?.name,
      status: item.show.status, // 'Running', 'Ended', 'In Development'
    }));
  } catch (error) {
    console.error('Error searching TVMaze:', error);
    throw error;
  }
};

/**
 * Получить информацию о сериале по ID
 */
export const getShowDetails = async (showId) => {
  try {
    const response = await fetch(`${TVMAZE_BASE_URL}/shows/${showId}`);
    if (!response.ok) throw new Error('TVMaze get show failed');
    
    const show = await response.json();
    
    return {
      id: show.id,
      name: show.name,
      summary: show.summary?.replace(/<[^>]*>/g, '') || '',
      premiered: show.premiered,
      ended: show.ended,
      genres: show.genres || [],
      image: show.image?.medium || show.image?.original,
      network: show.network?.name,
      country: show.network?.country?.name,
      status: show.status,
      officialSite: show.officialSite,
      imdbId: show.externals?.imdb,
    };
  } catch (error) {
    console.error('Error getting TVMaze show details:', error);
    throw error;
  }
};

/**
 * Получить расписание эпизодов сериала
 */
export const getShowEpisodes = async (showId) => {
  try {
    const response = await fetch(`${TVMAZE_BASE_URL}/shows/${showId}/episodes`);
    if (!response.ok) throw new Error('TVMaze get episodes failed');
    
    const episodes = await response.json();
    
    return episodes.map(ep => ({
      id: ep.id,
      season: ep.season,
      number: ep.number,
      name: ep.name,
      airdate: ep.airdate,
      airstamp: ep.airstamp,
      runtime: ep.runtime,
      summary: ep.summary?.replace(/<[^>]*>/g, '') || '',
      image: ep.image?.medium || ep.image?.original,
    }));
  } catch (error) {
    console.error('Error getting TVMaze episodes:', error);
    throw error;
  }
};

/**
 * Получить следующий эпизод сериала
 */
export const getNextEpisode = async (showId) => {
  try {
    const response = await fetch(`${TVMAZE_BASE_URL}/shows/${showId}?embed=nextepisode`);
    if (!response.ok) throw new Error('TVMaze get next episode failed');
    
    const show = await response.json();
    const nextEpisode = show._embedded?.nextepisode;
    
    if (!nextEpisode) return null;
    
    return {
      id: nextEpisode.id,
      season: nextEpisode.season,
      number: nextEpisode.number,
      name: nextEpisode.name,
      airdate: nextEpisode.airdate,
      airstamp: nextEpisode.airstamp,
      summary: nextEpisode.summary?.replace(/<[^>]*>/g, '') || '',
    };
  } catch (error) {
    console.error('Error getting next episode:', error);
    return null;
  }
};

/**
 * Проверить, вышел ли новый эпизод (для уведомлений)
 */
export const checkNewEpisodes = async (userShows) => {
  const newEpisodes = [];
  
  for (const show of userShows) {
    try {
      if (!show.tvmazeId) continue;
      
      const nextEpisode = await getNextEpisode(show.tvmazeId);
      if (!nextEpisode) continue;
      
      const episodeDate = new Date(nextEpisode.airstamp);
      const now = new Date();
      
      // Эпизод вышел за последние 24 часа
      const timeDiff = now - episodeDate;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff >= 0 && hoursDiff <= 24) {
        newEpisodes.push({
          showName: show.title,
          showId: show.id,
          episode: {
            season: nextEpisode.season,
            number: nextEpisode.number,
            name: nextEpisode.name,
            aired: nextEpisode.airdate,
          },
        });
      }
    } catch (error) {
      console.error(`Error checking episodes for ${show.title}:`, error);
    }
  }
  
  return newEpisodes;
};

/**
 * Получить сериалы с эпизодами, выходящими сегодня
 */
export const getShowsAiringToday = async () => {
  try {
    const response = await fetch(`${TVMAZE_BASE_URL}/schedule?country=US&date=${new Date().toISOString().split('T')[0]}`);
    if (!response.ok) throw new Error('TVMaze get schedule failed');
    
    const schedule = await response.json();
    
    return schedule.map(item => ({
      showName: item.show.name,
      showId: item.show.id,
      episode: {
        season: item.season,
        number: item.number,
        name: item.name,
        airtime: item.airtime,
        airdate: item.airdate,
      },
    }));
  } catch (error) {
    console.error('Error getting shows airing today:', error);
    return [];
  }
};

