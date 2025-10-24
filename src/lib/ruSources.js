// Русские источники: Kinopoisk (фильмы/сериалы) + Shikimori (аниме) + (опц.) TMDB
// API ключи интегрированы в код для безопасности
const KP_KEY   = '2ea0ffd7-e197-4f7f-8ffb-7ef5b525474a';
const TMDB_KEY = 'd13fd5e17ec6be5cdd603058af30ad8a';

// === Маппинг жанров в теги ===
const genreToTagsMap = {
  // Аниме жанры (Shikimori)
  'Action': ['боевик', 'приключения'],
  'Adventure': ['приключения'],
  'Comedy': ['комедия'],
  'Drama': ['драма'],
  'Fantasy': ['фэнтези'],
  'Horror': ['ужасы'],
  'Mystery': ['мистика', 'детектив'],
  'Romance': ['романтика'],
  'Sci-Fi': ['научная фантастика'],
  'Slice of Life': ['повседневность'],
  'Sports': ['спокон'],
  'Supernatural': ['мистика'],
  'Thriller': ['триллер'],
  'School': ['школа'],
  'Mecha': ['меха'],
  'Mahou Shoujo': ['махо-седзе'],
  'Seinen': ['сэйнэн'],
  'Shoujo': ['сёдзё'],
  'Shounen': ['сёнэн'],
  'Kids': ['детский'],
  'Isekai': ['исекай'],
  'Martial Arts': ['боевые искусства'],
  'Military': ['военный'],
  'Police': ['полиция'],
  'Psychological': ['психология'],
  'Samurai': ['самураи'],
  'Space': ['космос'],
  'Super Power': ['суперсилы'],
  'Vampire': ['вампиры'],
  'Historical': ['история'],
  'Magic': ['магия'],
  'Parody': ['пародия'],
  'Demons': ['демоны'],
  'Game': ['игры'],
  'Harem': ['гарем'],
  'Josei': ['дзёсэй'],
  'Kids': ['детский'],
  'Music': ['музыка'],
  'Mystery': ['мистика'],
  'Parody': ['пародия'],
  'Police': ['полиция'],
  'Psychological': ['психология'],
  'Romance': ['романтика'],
  'Samurai': ['самураи'],
  'School': ['школа'],
  'Sci-Fi': ['научная фантастика'],
  'Seinen': ['сэйнэн'],
  'Shoujo': ['сёдзё'],
  'Shoujo Ai': ['сёдзё-ай'],
  'Shounen': ['сёнэн'],
  'Shounen Ai': ['сёнэн-ай'],
  'Slice of Life': ['повседневность'],
  'Space': ['космос'],
  'Sports': ['спокон'],
  'Super Power': ['суперсилы'],
  'Supernatural': ['мистика'],
  'Thriller': ['триллер'],
  'Vampire': ['вампиры'],
  
  // Кино жанры (Kinopoisk/TMDB) - русские названия
  'фантастика': ['научная фантастика'],
  'драма': ['драма'],
  'комедия': ['комедия'],
  'боевик': ['боевик'],
  'триллер': ['триллер'],
  'ужасы': ['ужасы'],
  'детектив': ['детектив'],
  'приключения': ['приключения'],
  'романтика': ['романтика'],
  'фэнтези': ['фэнтези'],
  'мистика': ['мистика'],
  'семейный': ['семейный'],
  'мультфильм': ['мультфильм'],
  'документальный': ['документальный'],
  'биография': ['биография'],
  'история': ['история'],
  'военный': ['военный'],
  'вестерн': ['вестерн'],
  'криминал': ['криминал'],
  'спорт': ['спорт'],
  'музыка': ['музыка'],
  'мюзикл': ['мюзикл'],
  
  // Дополнительные жанры Kinopoisk
  'мелодрама': ['романтика'],
  'нуар': ['детектив'],
  'полицейский': ['криминал'],
  'психологический': ['психология'],
  'философский': ['философия'],
  'эротика': ['эротика'],
  'этнический': ['этнический'],
  
  // TMDB жанры (английские)
  'Science Fiction': ['научная фантастика'],
  'Action': ['боевик'],
  'Adventure': ['приключения'],
  'Comedy': ['комедия'],
  'Drama': ['драма'],
  'Fantasy': ['фэнтези'],
  'Horror': ['ужасы'],
  'Mystery': ['мистика'],
  'Romance': ['романтика'],
  'Thriller': ['триллер'],
  'Crime': ['криминал'],
  'Family': ['семейный'],
  'Animation': ['мультфильм'],
  'Documentary': ['документальный'],
  'Biography': ['биография'],
  'History': ['история'],
  'War': ['военный'],
  'Western': ['вестерн'],
  'Sport': ['спорт'],
  'Music': ['музыка'],
  'Musical': ['мюзикл']
};

// Функция для получения тегов по жанрам
export function getTagsFromGenres(genres) {
  if (!genres || !Array.isArray(genres)) return [];
  
  const tags = new Set();
  genres.forEach(genre => {
    let genreName;
    if (typeof genre === 'string') {
      genreName = genre;
    } else if (genre.name) {
      genreName = genre.name;
    } else if (genre.russian) {
      genreName = genre.russian;
    } else if (genre.genre) {
      genreName = genre.genre;
    }
    
    if (genreName) {
      const mappedTags = genreToTagsMap[genreName] || genreToTagsMap[genreName.toLowerCase()];
      if (mappedTags) {
        mappedTags.forEach(tag => tags.add(tag));
      }
    }
  });
  
  return Array.from(tags);
}

// ---------- Shikimori: аниме ----------
export async function searchAnimeRU(query) {
  const url = `https://shikimori.one/api/animes?limit=10&order=popularity&search=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Shikimori: ошибка ответа');
  const list = await res.json();
  
  // Получаем детальную информацию для каждого аниме, чтобы получить жанры
  const detailedList = await Promise.all(
    list.map(async (x) => {
      try {
        const detailRes = await fetch(`https://shikimori.one/api/animes/${x.id}`, { 
          headers: { Accept: 'application/json' } 
        });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          return {
            ...x,
            genres: detail.genres || []
          };
        }
      } catch (e) {
        console.warn('Failed to fetch details for anime', x.id, e);
      }
      return {
        ...x,
        genres: []
      };
    })
  );
  
  return detailedList.map((x) => ({
    source: 'shikimori',
    id: x.id,
    type: 'anime',
    title: x.russian || x.name || '',
    originalTitle: x.name || '',
    year: x.aired_on ? new Date(x.aired_on).getFullYear() : undefined,
    totalEpisodes: x.episodes || undefined,
    imageUrl: x.image?.preview
      ? `https://shikimori.one${x.image.preview}`
      : (x.image?.original ? `https://shikimori.one${x.image.original}` : undefined),
    url: `https://shikimori.one${x.url || `/animes/${x.id}`}`,
    genres: x.genres || [],
    tags: getTagsFromGenres(x.genres || []),
    _raw: x,
  }));
}

// ---------- Shikimori: манга ----------
export async function searchMangaRU(query) {
  const url = `https://shikimori.one/api/mangas?limit=10&order=popularity&search=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Shikimori: ошибка ответа');
  const list = await res.json();
  
  // Получаем детальную информацию для каждой манги, чтобы получить жанры
  const detailedList = await Promise.all(
    list.map(async (x) => {
      try {
        const detailRes = await fetch(`https://shikimori.one/api/mangas/${x.id}`, { 
          headers: { Accept: 'application/json' } 
        });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          return {
            ...x,
            genres: detail.genres || []
          };
        }
      } catch (e) {
        console.warn('Failed to fetch details for manga', x.id, e);
      }
      return {
        ...x,
        genres: []
      };
    })
  );
  
  return detailedList.map((x) => ({
    source: 'shikimori',
    id: x.id,
    type: 'manga',
    title: x.russian || x.name || '',
    originalTitle: x.name || '',
    year: x.aired_on ? new Date(x.aired_on).getFullYear() : undefined,
    totalEpisodes: x.chapters || undefined,
    imageUrl: x.image?.preview
      ? `https://shikimori.one${x.image.preview}`
      : (x.image?.original ? `https://shikimori.one${x.image.original}` : undefined),
    url: `https://shikimori.one${x.url || `/mangas/${x.id}`}`,
    genres: x.genres || [],
    tags: getTagsFromGenres(x.genres || []),
    _raw: x,
  }));
}

// ---------- Kinopoisk: фильмы/сериалы ----------
async function kpFetch(path) {
  if (!KP_KEY) return null;
  const res = await fetch(`https://kinopoiskapiunofficial.tech${path}`, {
    headers: {
      'X-API-KEY': KP_KEY,
      'Accept': 'application/json',
    }
  });
  if (!res.ok) throw new Error(`Kinopoisk: ${res.status}`);
  return res.json();
}

export async function searchKinopoiskRU(query) {
  const json = await kpFetch(`/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query)}&page=1`);
  if (!json) return [];
  const films = json.films || [];
  return films.map((f) => ({
    source: 'kinopoisk',
    id: f.filmId,
    type: f.type === 'TV_SERIES' ? 'series' : 'movie',
    title: f.nameRu || f.nameOriginal || '',
    originalTitle: f.nameOriginal || f.nameEn || '',
    year: f.year || undefined,
    imageUrl: f.posterUrlPreview || f.posterUrl || undefined,
    url: `https://www.kinopoisk.ru/film/${f.filmId}/`,
    genres: f.genres || [],
    tags: getTagsFromGenres(f.genres || []),
    _raw: f,
  }));
}

export async function getSeriesDetailsRU(id, sourceHint) {
  // 1) Kinopoisk — количество эпизодов по сезонам
  if (!sourceHint || sourceHint === 'kinopoisk') {
    try {
      const seasons = await kpFetch(`/api/v2.2/films/${id}/seasons`);
      if (seasons && Array.isArray(seasons.items)) {
        const totalEpisodes = seasons.items.reduce((sum, s) => sum + (s.episodes?.length || 0), 0);
        return { totalEpisodes: totalEpisodes || undefined };
      }
    } catch (_) {}
  }

  // 2) Fallback: TMDB (если нужен)
  if (sourceHint === 'tmdb' && TMDB_KEY) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?language=ru-RU&api_key=${TMDB_KEY}`);
      if (res.ok) {
        const d = await res.json();
        return {
          totalEpisodes: typeof d.number_of_episodes === 'number' ? d.number_of_episodes : undefined,
          year: d.first_air_date ? d.first_air_date.slice(0, 4) : undefined,
        };
      }
    } catch (_) {}
  }

  return null;
}

// ---------- Детали манги ----------
export async function getMangaDetailsRU(id) {
  try {
    const res = await fetch(`https://shikimori.one/api/mangas/${id}`, { 
      headers: { Accept: 'application/json' } 
    });
    if (res.ok) {
      const manga = await res.json();
      return {
        totalEpisodes: manga.chapters || undefined,
        year: manga.aired_on ? new Date(manga.aired_on).getFullYear() : undefined,
      };
    }
  } catch (e) {
    console.warn('Failed to fetch manga details', id, e);
  }
  return null;
}

// ---------- (опционально) TMDB поиск ----------
async function tmdbSearch(kind, query) {
  if (!TMDB_KEY) return [];
  const url = `https://api.themoviedb.org/3/search/${kind}?query=${encodeURIComponent(query)}&language=ru-RU&include_adult=false&api_key=${TMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();

  return (json.results || []).map((r) => ({
    source: 'tmdb',
    id: r.id,
    type: kind === 'movie' ? 'movie' : 'series',
    title: (kind === 'movie' ? r.title : r.name) || '',
    originalTitle: (kind === 'movie' ? r.original_title : r.original_name) || '',
    year: (r.release_date || r.first_air_date) ? (r.release_date || r.first_air_date).slice(0, 4) : undefined,
    imageUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
    url: `https://www.themoviedb.org/${kind === 'movie' ? 'movie' : 'tv'}/${r.id}?language=ru-RU`,
    genres: r.genre_ids || [],
    tags: getTagsFromGenres(r.genre_ids || []),
    _raw: r,
  }));
}

// ---------- Унифицированный поиск ----------
export async function searchRU(type, query) {
  if (!query || !query.trim()) return [];
  if (type === 'anime')  return searchAnimeRU(query);
  if (type === 'manga')  return searchMangaRU(query);

  // приоритет — Kinopoisk
  const kp = await searchKinopoiskRU(query);
  if (kp.length) {
    const filtered = kp.filter(i => (type === 'movie' ? i.type === 'movie' : i.type === 'series'));
    return filtered.length ? filtered : kp;
  }

  // запасной вариант — TMDB (если ключ задан)
  if (type === 'movie')  return tmdbSearch('movie', query);
  if (type === 'series') return tmdbSearch('tv', query);
  return [];
}
