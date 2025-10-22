// Русские источники: Kinopoisk (фильмы/сериалы) + Shikimori (аниме) + (опц.) TMDB
// API ключи интегрированы в код для безопасности
const KP_KEY   = '2ea0ffd7-e197-4f7f-8ffb-7ef5b525474a';
const TMDB_KEY = 'd13fd5e17ec6be5cdd603058af30ad8a';

// ---------- Shikimori: аниме ----------
export async function searchAnimeRU(query) {
  const url = `https://shikimori.one/api/animes?limit=10&order=popularity&search=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Shikimori: ошибка ответа');
  const list = await res.json();
  return list.map((x) => ({
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
    _raw: r,
  }));
}

// ---------- Унифицированный поиск ----------
export async function searchRU(type, query) {
  if (!query || !query.trim()) return [];
  if (type === 'anime')  return searchAnimeRU(query);

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
