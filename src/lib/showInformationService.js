/**
 * Единый сервис для получения информации о сериалах
 * Использует альтернативные API если основной недоступен
 */

/**
 * Поиск сериала через TVMaze
 */
export const searchShowMultipleSources = async (query) => {
  try {
    console.log('🔍 Ищу в TVMaze...');
    const { searchShow } = await import('./tvmazeService');
    const results = await searchShow(query);
    
    if (results.length > 0) {
      return {
        success: true,
        provider: 'TVMaze',
        results: results.map(item => ({
          id: item.id,
          title: item.name,
          year: item.premiered?.split('-')[0] || null,
          description: item.summary || '',
          poster: item.image,
          network: item.network,
          country: item.country,
          status: item.status, // 'Running', 'Ended'
          genres: item.genres || [],
          source: 'tvmaze',
          sourceId: item.id,
        })),
      };
    }
    
    return {
      success: false,
      error: 'Ничего не найдено',
      results: [],
    };
  } catch (error) {
    console.error('❌ Ошибка поиска в TVMaze:', error);
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
};

/**
 * Получить детальную информацию о сериале
 */
export const getShowDetailsMultipleSources = async (source, sourceId) => {
  if (source === 'tvmaze') {
    try {
      const { getShowDetails, getShowEpisodes } = await import('./tvmazeService');
      const details = await getShowDetails(sourceId);
      const episodes = await getShowEpisodes(sourceId);
      
      return {
        success: true,
        ...details,
        episodes,
        totalEpisodes: episodes.length,
        totalSeasons: Math.max(...episodes.map(e => e.season), 0),
      };
    } catch (error) {
      console.error('TVMaze error:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Неизвестный источник' };
};

/**
 * Проверить доступность источника (TVMaze)
 */
export const checkAvailableSources = async () => {
  const results = [];
  
  try {
    const { searchShow } = await import('./tvmazeService');
    const test = await searchShow('Breaking Bad');
    results.push({
      provider: 'TVMaze',
      available: test.length > 0,
      message: test.length > 0 ? '✅ Доступен и работает' : '❌ Нет результатов',
    });
  } catch (error) {
    results.push({
      provider: 'TVMaze',
      available: false,
      message: `❌ Ошибка: ${error.message}`,
    });
  }
  
  return results;
};

