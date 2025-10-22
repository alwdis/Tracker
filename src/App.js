import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Plus, Film, Tv, Play, Search as SearchIconLucide, X, BarChart3, Sun, Moon, Download, Upload, Tag, Filter, RefreshCw } from 'lucide-react';
import { APP_VERSION } from './version';

// Импортируем компоненты
import AddDialog from './components/AddDialog/AddDialog';
import MediaCard from './components/MediaCard/MediaCard';
import RatingDialog from './components/RatingDialog/RatingDialog';
import Statistics from './components/Statistics/Statistics';
import ImportExportDialog from './components/ImportExportDialog/ImportExportDialog';
import BackupDialog from './components/BackupDialog/BackupDialog';

/* ---------- ТЕМА ---------- */
const lightTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSecondary: '#f1f5f9',
  text: '#334155',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  accent: '#667eea',
  accentGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  rating: '#f59e0b',
  shadow: 'rgba(0, 0, 0, 0.1)',
  cardHover: 'rgba(255, 255, 255, 0.8)'
};

const darkTheme = {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceSecondary: '#2d2d2d',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textTertiary: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  accent: '#667eea',
  accentGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  rating: '#ffd700',
  shadow: 'rgba(0, 0, 0, 0.3)',
  cardHover: 'rgba(255, 255, 255, 0.05)'
};

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: ${p => p.theme.background};
    color: ${p => p.theme.text};
    overflow: hidden;
    transition: all .3s ease;
  }

  @keyframes pulse { 0%{opacity:1} 50%{opacity:.5} 100%{opacity:1} }
  @keyframes slideUp { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: ${p => p.theme.surfaceSecondary}; }
  ::-webkit-scrollbar-thumb { background: ${p => p.theme.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${p => p.theme.textTertiary}; }
  ::selection { background: rgba(102,126,234,.3); color:#fff; }
`;

/* ---------- LAYOUT ---------- */
const AppContainer = styled.div`
  display:flex; flex-direction:column; height:100vh; background:${p=>p.theme.background}; position:relative; transition:all .3s ease;
`;

const Header = styled.header`
  display:grid; grid-template-columns:auto 1fr auto; align-items:center;
  padding:16px 24px; background:${p=>p.theme.surface};
  backdrop-filter: blur(20px);
  border-bottom:1px solid ${p=>p.theme.border}; gap:16px;
`;

const HeaderControls = styled.div`display:flex; align-items:center; gap:12px;`;

const IconButton = styled.button`
  display:flex; align-items:center; justify-content:center;
  width:44px; height:44px; border-radius:9999px;
  background:${p=>p.theme.surfaceSecondary}; border:1px solid ${p=>p.theme.border};
  color:${p=>p.theme.text}; cursor:pointer; transition:all .2s ease;
  &:hover { background:${p=>p.theme.accent}; color:#fff; transform:scale(1.05); }
  &.success:hover{background:${p=>p.theme.success}}
  &.warning:hover{background:${p=>p.theme.warning}}
  &.info:hover{background:${p=>p.theme.accent}}
`;

const ThemeToggle = styled(IconButton)``;

const OnlineStatus = styled.div`
  display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600;
  color:${p=>p.$isOnline ? p.theme.success : p.theme.error};
  background:${p=>p.$isOnline ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)'};
  padding:4px 8px; border-radius:8px;
`;
const OnlineDot = styled.div`
  width:6px; height:6px; border-radius:50%;
  background:${p=>p.$isOnline ? p.theme.success : p.theme.error};
  animation:${p=>p.$isOnline ? 'pulse 2s infinite' : 'none'};
`;

const TabsRow = styled.div`display:flex; align-items:center; gap:12px;`;
const TopTab = styled.button`
  display:flex; align-items:center; gap:10px;
  padding:10px 14px; border-radius:9999px;
  border:1px solid ${p=>p.theme.border};
  background:${p=>p.$active ? p.theme.surfaceSecondary : 'transparent'};
  color:${p=>p.$active ? p.theme.text : p.theme.textSecondary};
  font-weight:600; transition:.2s; &:hover{background:${p=>p.theme.surfaceSecondary};}
`;

const SearchContainer = styled.div`
  display:flex; align-items:center;
  background:${p=>p.theme.surfaceSecondary};
  border:1px solid ${p=>p.theme.border};
  border-radius:9999px; padding:8px 16px;
  flex:1; min-width:320px; transition:all .2s ease;
  &:focus-within{border-color:${p=>p.theme.accent}; background:${p=>p.theme.surface};}
`;
const SearchInput = styled.input`
  background:none; border:none; color:${p=>p.theme.text};
  font-size:16px; padding:8px 12px; flex:1; outline:none;
  &::placeholder{ color:${p=>p.theme.textTertiary}; }
`;
const SearchActionButton = styled.button`
  background:none; border:none; padding:4px; border-radius:8px;
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  color:${p=>p.$active ? p.theme.accent : p.theme.textTertiary};
  transition:.2s; &:hover{ color:${p=>p.theme.text}; background:${p=>p.theme.surfaceSecondary}; }
`;

const SearchIcon = styled(SearchIconLucide)`
  color:${p=>p.theme.textTertiary}; margin-right:8px;
`;

const ClearSearchButton = styled.button`
  background:none; border:none; color:${p=>p.theme.textTertiary}; cursor:pointer;
  padding:4px; border-radius:4px; transition:.2s;
  &:hover{ color:${p=>p.theme.text}; background:${p=>p.theme.surfaceSecondary}; }
`;

/* Старая полоса вкладок — скрыта */
const TabsContainer = styled.div`
  display: none;
  background:${p=>p.theme.surface};
  backdrop-filter: blur(20px);
  border-bottom:1px solid ${p=>p.theme.border};
  padding:0 32px; gap:1px; transition:all .3s ease;
`;

/* Контент */
const FiltersContainer = styled.div`
  display:flex; align-items:center; gap:16px; padding:16px 32px;
  background:${p=>p.theme.surface}; border-bottom:1px solid ${p=>p.theme.border}; flex-wrap:wrap;
`;
const FilterLabel = styled.span`font-size:14px; font-weight:600; color:${p=>p.theme.textSecondary}; display:flex; align-items:center; gap:8px;`;
const TagsContainer = styled.div`display:flex; flex-wrap:wrap; gap:8px; flex:1;`;
const TagChip = styled.button`
  display:flex; align-items:center; gap:6px; padding:6px 12px;
  background:${p=>p.$selected ? p.theme.accent : p.theme.surfaceSecondary};
  border:1px solid ${p=>p.$selected ? p.theme.accent : p.theme.border};
  border-radius:20px; color:${p=>p.$selected ? '#fff' : p.theme.text}; font-size:12px; font-weight:500; cursor:pointer; transition:.2s;
  &:hover{ background:${p=>p.$selected ? p.theme.accent : p.theme.surface}; transform:translateY(-1px);}
`;
const TagCount = styled.span`
  font-size:10px; background:${p=>p.$selected ? 'rgba(255,255,255,.2)' : p.theme.border};
  border-radius:10px; padding:2px 6px; color:${p=>p.$selected ? '#fff' : p.theme.textSecondary};
`;
const ClearFiltersButton = styled.button`
  display:flex; align-items:center; gap:6px; padding:8px 12px;
  background:${p=>p.theme.surfaceSecondary}; border:1px solid ${p=>p.theme.border};
  border-radius:8px; color:${p=>p.theme.textSecondary}; font-size:12px; font-weight:500; cursor:pointer; transition:.2s;
  &:hover{ background:${p=>p.theme.surface}; color:${p=>p.theme.text}; }
`;

const MainContent = styled.main`flex:1; display:flex; flex-direction:column; overflow:hidden;`;
const ContentArea = styled.div`
  flex:1; padding:clamp(16px, 2vw, 32px); overflow-y:auto; background:${p=>p.theme.background}; transition:all .3s ease;
`;

const StatusSection = styled.div`margin-bottom:40px;`;
const StatusTitle = styled.h2`
  font-size:20px; font-weight:700; margin-bottom:20px; color:${p=>p.theme.text}; display:flex; align-items:center; gap:10px;
  &::after { content:''; flex:1; height:1px; background:${p=>p.theme.border}; margin-left:10px; }
`;

const MediaGrid = styled.div`
  display:grid; grid-template-columns:repeat(auto-fill, minmax(420px, 1fr)); gap:24px; align-items:stretch;
  @media (max-width:1100px){ grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); }
  @media (max-width:768px){ grid-template-columns:1fr; }
`;

const EmptyState = styled.div`
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  height:400px; text-align:center; color:${p=>p.theme.textTertiary};
  h3{ font-size:24px; margin-bottom:12px; font-weight:600; color:${p=>p.theme.text}; }
  p{ font-size:16px; margin-bottom:24px; }
`;
const SearchEmptyState = styled(EmptyState)` h3{ color:${p=>p.theme.accent}; }`;

const FloatingAddButton = styled.button`
  position:fixed; bottom:32px; right:32px; display:flex; align-items:center; gap:12px;
  padding:16px 24px; background:${p=>p.theme.accentGradient}; border:none; border-radius:50px; color:#fff; font-size:16px; font-weight:600; cursor:pointer; transition:all .3s ease;
  box-shadow:0 8px 32px rgba(102,126,234,.4); z-index:1000;
  &:hover{ transform:translateY(-2px) scale(1.05); box-shadow:0 12px 40px rgba(102,126,234,.6); }
`;

const Footer = styled.footer`
  text-align:center; padding:15px; color:${p=>p.theme.textTertiary}; font-size:12px;
  border-top:1px solid ${p=>p.theme.border}; display:flex; flex-direction:column; gap:4px; background:${p=>p.theme.surface};
`;
const Version = styled.span`font-size:10px; opacity:.5; color:${p=>p.theme.accent};`;
const UpdateButton = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.textSecondary};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  opacity: 0.7;
  
  &:hover {
    background: ${p => p.theme.surfaceSecondary};
    opacity: 1;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ---------- ДАННЫЕ/ЛОГИКА ---------- */

// Конфигурация статусов
const statusConfig = {
  watching: { title: 'Смотрю' },
  planned: { title: 'Запланировано' },
  completed: { title: 'Просмотрено' },
  dropped: { title: 'Брошено' }
};

// PWA (урезанный до нужного)
const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')
    );
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => {
        if (!isStandalone && !window.electronAPI) setShowInstallPrompt(true);
      }, 5000);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const lastDismissed = localStorage.getItem('pwaPromptDismissed');
    if (lastDismissed && (Date.now() - parseInt(lastDismissed)) < 30 * 24 * 60 * 60 * 1000) {
      setDeferredPrompt(null);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwaPromptDismissed', Date.now());
  };

  return { isOnline, isStandalone, showInstallPrompt, installPWA, dismissInstallPrompt };
};

// Поиск + фильтры
const smartSearch = (items, query, selectedTags = []) => {
  let filtered = items;

  if (selectedTags.length > 0) {
    filtered = filtered.filter(item =>
      selectedTags.every(tag =>
        item.tags && item.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
      )
    );
  }

  if (!query.trim()) return filtered;

  const terms = query.toLowerCase().split(' ').filter(Boolean);
  return filtered.filter(item => {
    const text = `
      ${item.title}
      ${item.type}
      ${item.status}
      ${item.comment || ''}
      ${item.url || ''}
      ${item.tags ? item.tags.join(' ') : ''}
    `.toLowerCase();

    return terms.every(term =>
      text.includes(term) ||
      (term === 'смотрю' && item.status === 'watching') ||
      (term === 'просмотрено' && item.status === 'completed') ||
      (term === 'запланировано' && item.status === 'planned') ||
      (term === 'брошено' && item.status === 'dropped') ||
      (term === 'аниме' && item.type === 'anime') ||
      (term === 'фильм' && item.type === 'movie') ||
      (term === 'сериал' && item.type === 'series') ||
      (term === 'оценка' && item.rating > 0) ||
      (term === 'без' && item.rating === 0) ||
      (/^\d+\/10$/.test(term) && item.rating === parseInt(term)) ||
      (/^\d+$/.test(term) && item.rating === parseInt(term)) ||
      (term.startsWith('#') && item.tags && item.tags.some(t => t.toLowerCase().includes(term.slice(1))))
    );
  });
};

// Экспорт/импорт
const exportData = (media, format = 'json') => {
  const data = {
    version: '1.1.3',
    exportDate: new Date().toISOString(),
    totalItems: media.length,
    data: media
  };

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    return true;
  }
  if (format === 'csv') {
    const headers = ['Title','Type','Status','Rating','WatchedEpisodes','TotalEpisodes','Comment','URL','Tags'];
    const rows = [
      headers.join(','),
      ...media.map(item => [
        `"${(item.title || '').replace(/"/g,'""')}"`,
        item.type || '',
        item.status || '',
        item.rating ?? '',
        item.watchedEpisodes ?? '',
        item.totalEpisodes ?? '',
        `"${(item.comment || '').replace(/"/g,'""')}"`,
        `"${item.url || ''}"`,
        `"${(item.tags || []).join(', ')}"`
      ].join(','))
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    return true;
  }
  return false;
};

const importData = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      let imported;
      if (file.name.endsWith('.json')) {
        imported = JSON.parse(content);
        if (!imported.data || !Array.isArray(imported.data)) throw new Error('Неверный формат файла. Ожидается JSON с полем "data".');
        callback(imported.data);
      } else if (file.name.endsWith('.csv')) {
        const lines = content.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.replace(/"/g,'').trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g,'').trim());
          const row = {};
          headers.forEach((h,i)=> row[h.toLowerCase()] = values[i] || '');
          return {
            title: row.title,
            type: row.type || 'anime',
            status: row.status || 'planned',
            rating: row.rating ? parseInt(row.rating) : 0,
            watchedEpisodes: row.watchedepisodes ? parseInt(row.watchedepisodes) : 0, // фикс
            totalEpisodes: row.totalepisodes ? parseInt(row.totalepisodes) : undefined,
            comment: row.comment || '',
            url: row.url || '',
            tags: row.tags ? row.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
            id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
            createdAt: new Date().toISOString()
          };
        });
        callback(data);
      } else {
        throw new Error('Неподдерживаемый формат файла. Используйте JSON или CSV.');
      }
    } catch (err) {
      callback(null, err.message);
    }
  };
  reader.onerror = () => callback(null, 'Ошибка чтения файла');
  reader.readAsText(file);
};

/* ---------- APP ---------- */
function App() {
  const [activeTab, setActiveTab] = useState('anime');
  const [media, setMedia] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [ratingDialog, setRatingDialog] = useState({ show: false, item: null });
  const [importExportDialog, setImportExportDialog] = useState({ show: false, mode: null });
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const { isOnline, isStandalone, showInstallPrompt, installPWA, dismissInstallPrompt } = usePWA();

  useEffect(() => {
    loadMediaData();
    const savedTheme = localStorage.getItem('tracker-theme');
    if (savedTheme) setIsDarkTheme(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = !isDarkTheme;
    setIsDarkTheme(next);
    localStorage.setItem('tracker-theme', next ? 'dark' : 'light');
  };

  const loadMediaData = async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.readMediaData();
        setMedia(data.map(i => ({ ...i, rating: i.rating || 0, comment: i.comment || '', tags: i.tags || [] })));
      } else {
        const saved = localStorage.getItem('media-data');
        if (saved) {
          const data = JSON.parse(saved);
          setMedia(data.map(i => ({ ...i, rating: i.rating || 0, comment: i.comment || '', tags: i.tags || [] })));
        }
      }
    } catch (e) { console.error('Error loading media data:', e); }
  };

  const saveMediaData = async (newMedia) => {
    try {
      setMedia(newMedia);
      if (window.electronAPI) await window.electronAPI.writeMediaData(newMedia);
      else localStorage.setItem('media-data', JSON.stringify(newMedia));
    } catch (e) { console.error('Error saving media data:', e); }
  };

  const addMediaItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      rating: item.rating || 0,
      comment: item.comment || '',
      tags: item.tags || []
    };
    saveMediaData([...media, newItem]);
  };

  const updateMediaItem = (id, updates) => {
    const newMedia = media.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, ...updates };
      if (updates.watchedEpisodes !== undefined && item.totalEpisodes && updates.watchedEpisodes >= item.totalEpisodes) {
        next.status = 'completed';
        if (!item.rating) setTimeout(() => setRatingDialog({ show: true, item: next }), 500);
      }
      return next;
    });
    saveMediaData(newMedia);
  };

  const deleteMediaItem = (id) => saveMediaData(media.filter(i => i.id !== id));
  const editMediaItem = (item) => setEditingItem(item);
  const saveEditedItem = (updated) => { saveMediaData(media.map(i => i.id === updated.id ? updated : i)); setEditingItem(null); };
  const handleRatingSave = (id, rating, comment) => { updateMediaItem(id, { rating, comment }); setRatingDialog({ show: false, item: null }); };
  const clearSearch = () => setSearchQuery('');

  const handleExport = () => setImportExportDialog({ show: true, mode: 'export' });
  const handleImport = () => setImportExportDialog({ show: true, mode: 'import' });
  const handleBackup = () => setImportExportDialog({ show: true, mode: 'backup' });
  const handleExportConfirm = (format) => { exportData(media, format); setImportExportDialog({ show: false, mode: null }); };
  
  const checkForUpdates = async () => {
    if (isCheckingUpdates) return;
    
    setIsCheckingUpdates(true);
    try {
      if (window.electronAPI?.checkForUpdates) {
        await window.electronAPI.checkForUpdates();
      } else {
        console.log('Electron API not available');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setTimeout(() => setIsCheckingUpdates(false), 2000); // Сброс через 2 секунды
    }
  };
  const handleImportConfirm = (importedData, merge = false) => {
    let newData;
    if (merge) {
      const ids = new Set(media.map(i => i.id));
      newData = [...media, ...importedData.filter(i => !ids.has(i.id))];
    } else newData = importedData;
    saveMediaData(newData);
    setImportExportDialog({ show: false, mode: null });
  };

  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const clearFilters = () => { setSelectedTags([]); setSearchQuery(''); };

  const getAllTags = () => {
    const counts = (media.flatMap(i => i.tags || [])).reduce((acc, t) => (acc[t] = (acc[t] || 0) + 1, acc), {});
    return Object.entries(counts).sort(([,a],[,b]) => b - a).map(([tag, count]) => ({ tag, count }));
  };

  // Фильтрация
  const filteredByTab = media.filter(item => item.type === activeTab);
  const searchedMedia = smartSearch(filteredByTab, searchQuery, selectedTags);
  const favoritesApplied = showFavoritesOnly
    ? searchedMedia.filter(item => (item.rating && item.rating >= 7) || (item.tags && item.tags.some(t => /любим|favorite|fav/i.test(t))))
    : searchedMedia;

  const mediaByStatus = {
    watching: favoritesApplied.filter(item => item.status === 'watching'),
    planned:  favoritesApplied.filter(item => item.status === 'planned'),
    completed:favoritesApplied.filter(item => item.status === 'completed'),
    dropped:  favoritesApplied.filter(item => item.status === 'dropped')
  };

  const hasSearchResults = searchedMedia.length > 0;
  const hasAnyMedia = filteredByTab.length > 0;
  const isSearching = searchQuery.trim().length > 0 || selectedTags.length > 0;
  const allTags = getAllTags();

  const renderOnlineStatus = () => (
    <OnlineStatus $isOnline={isOnline}>
      <OnlineDot $isOnline={isOnline} />
      {isOnline ? 'Онлайн' : 'Офлайн'}
    </OnlineStatus>
  );

  const renderInstallPrompt = () => {
    if (!showInstallPrompt || window.electronAPI) return null;
    return (
      <div style={{
        position:'fixed', bottom:'20px', left:'20px', right:'20px',
        background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color:'#fff', padding:'16px', borderRadius:'12px',
        boxShadow:'0 8px 32px rgba(0,0,0,.3)', zIndex:10000, animation:'slideUp .3s ease'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px'}}>
          <div style={{flexShrink:0, fontSize:'24px'}}>📱</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600, marginBottom:4}}>Установить Tracker</div>
            <div style={{fontSize:12, opacity:.9}}>Добавьте приложение на главный экран для быстрого доступа</div>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={dismissInstallPrompt}
            style={{flex:1, padding:'8px 16px', border:'1px solid rgba(255,255,255,.3)', borderRadius:8, fontWeight:600, cursor:'pointer', background:'rgba(255,255,255,.2)', color:'#fff'}}>
            Позже
          </button>
          <button onClick={installPWA}
            style={{flex:1, padding:'8px 16px', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer', background:'#fff', color:'#667eea'}}>
            Установить
          </button>
        </div>
      </div>
    );
  };

  const content = () => {
    if (activeTab === 'statistics') return <Statistics media={media} isDarkTheme={isDarkTheme} />;

    if (hasSearchResults) {
      return (
        <>
          {Object.entries(mediaByStatus).map(([status, items]) =>
            items.length > 0 && (
              <StatusSection key={status}>
                <StatusTitle>
                  {statusConfig[status].title}
                  <span style={{ fontSize:14, opacity:.6, marginLeft:8 }}>({items.length})</span>
                </StatusTitle>
                <MediaGrid>
                  {items.map(item => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onUpdate={updateMediaItem}
                      onDelete={deleteMediaItem}
                      onEdit={editMediaItem}
                      isDarkTheme={isDarkTheme}
                    />
                  ))}
                </MediaGrid>
              </StatusSection>
            )
          )}
        </>
      );
    }

    if (isSearching) {
      return (
        <SearchEmptyState>
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить запрос или очистить фильтры</p>
          <p style={{ fontSize:14, opacity:.7 }}>
            {selectedTags.length > 0 && `Выбранные теги: ${selectedTags.join(', ')}`}
          </p>
        </SearchEmptyState>
      );
    }

    if (hasAnyMedia) {
      return (
        <>
          {Object.entries(mediaByStatus).map(([status, items]) =>
            items.length > 0 && (
              <StatusSection key={status}>
                <StatusTitle>{statusConfig[status].title}</StatusTitle>
                <MediaGrid>
                  {items.map(item => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onUpdate={updateMediaItem}
                      onDelete={deleteMediaItem}
                      onEdit={editMediaItem}
                      isDarkTheme={isDarkTheme}
                    />
                  ))}
                </MediaGrid>
              </StatusSection>
            )
          )}
        </>
      );
    }

    return (
      <EmptyState>
        <h3>Пока ничего нет</h3>
        <p>Может пора уже что-то добавить?</p>
      </EmptyState>
    );
  };

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <TabsRow>
            <TopTab $active={activeTab === 'anime'} onClick={() => setActiveTab('anime')}><Film size={18}/>Аниме</TopTab>
            <TopTab $active={activeTab === 'movie'} onClick={() => setActiveTab('movie')}><Play size={18}/>Фильмы</TopTab>
            <TopTab $active={activeTab === 'series'} onClick={() => setActiveTab('series')}><Tv size={18}/>Сериалы</TopTab>
            <TopTab $active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')}><BarChart3 size={18}/>Статистика</TopTab>
          </TabsRow>

          {activeTab !== 'statistics' && (
            <SearchContainer>
              <SearchIcon size={20}/>
              <SearchInput
                type="text"
                placeholder="Поиск по названию, тегам"
                value={searchQuery}
                onChange={(e)=>setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <ClearSearchButton onClick={clearSearch} title="Очистить поиск">
                  <X size={16}/>
                </ClearSearchButton>
              )}
              <SearchActionButton
                onClick={()=>setShowFavoritesOnly(v=>!v)}
                $active={showFavoritesOnly}
                title={showFavoritesOnly ? 'Показывать всё' : 'Только избранное (рейтинг ≥ 7)'}
                style={{marginLeft:4}}
              >
                {/* звезда, закрашивается при активном фильтре */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill={showFavoritesOnly?'currentColor':'none'} stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </SearchActionButton>
            </SearchContainer>
          )}

          <HeaderControls>
            <IconButton className="success" onClick={handleExport} title="Экспорт данных"><Download size={20}/></IconButton>
            <IconButton className="warning" onClick={handleImport} title="Импорт данных"><Upload size={20}/></IconButton>

            {window.electronAPI && (
              <IconButton className="info" onClick={()=>setBackupDialogOpen(true)} title="Управление бэкапами"><Download size={20}/></IconButton>
            )}


            <ThemeToggle onClick={toggleTheme} title={isDarkTheme ? 'Светлая тема' : 'Тёмная тема'}>
              {isDarkTheme ? <Sun size={20}/> : <Moon size={20}/>}
            </ThemeToggle>
          </HeaderControls>
        </Header>

        {/* Старая полоса вкладок убрана, но оставлена в коде на будущее */}
        <TabsContainer />

        {activeTab !== 'statistics' && getAllTags().length > 0 && (
          <FiltersContainer>
            <FilterLabel><Filter size={16}/>Теги:</FilterLabel>
            <TagsContainer>
              {getAllTags().slice(0, 10).map(({ tag, count }) => (
                <TagChip key={tag} $selected={selectedTags.includes(tag)} onClick={()=>toggleTag(tag)} title={`${count} тайтл(ов)`}>
                  <Tag size={12} />{tag}<TagCount $selected={selectedTags.includes(tag)}>{count}</TagCount>
                </TagChip>
              ))}
              {getAllTags().length > 10 && <TagChip $selected={false}>+{getAllTags().length - 10} еще...</TagChip>}
            </TagsContainer>
            {(selectedTags.length > 0 || searchQuery) && (
              <ClearFiltersButton onClick={clearFilters}><X size={14}/>Очистить</ClearFiltersButton>
            )}
          </FiltersContainer>
        )}

        <MainContent>
          <ContentArea>{content()}</ContentArea>
        </MainContent>

      

        <FloatingAddButton onClick={()=>setShowAddDialog(true)}>
          <Plus size={20}/>Добавить
        </FloatingAddButton>

        {showAddDialog && (
          <AddDialog onClose={()=>setShowAddDialog(false)} onSave={addMediaItem} isDarkTheme={isDarkTheme} />
        )}

        {editingItem && (
          <AddDialog item={editingItem} onClose={()=>setEditingItem(null)} onSave={saveEditedItem} isDarkTheme={isDarkTheme} />
        )}

        {ratingDialog.show && (
          <RatingDialog item={ratingDialog.item} onClose={()=>setRatingDialog({show:false, item:null})} onSave={handleRatingSave} isDarkTheme={isDarkTheme} />
        )}

        {importExportDialog.show && (
          <ImportExportDialog
            mode={importExportDialog.mode}
            onClose={()=>setImportExportDialog({ show:false, mode:null })}
            onExport={handleExportConfirm}
            onImport={handleImportConfirm}
            currentDataCount={media.length}
            isDarkTheme={isDarkTheme}
          />
        )}

        {window.electronAPI && (
          <BackupDialog open={backupDialogOpen} onClose={()=>setBackupDialogOpen(false)} darkMode={isDarkTheme} />
        )}

        {renderInstallPrompt()}

        <Footer>
          <Version>Tracker v{APP_VERSION}</Version>
          <UpdateButton 
            onClick={checkForUpdates} 
            disabled={isCheckingUpdates}
            title="Проверить обновления"
          >
            <RefreshCw size={12} style={{ 
              animation: isCheckingUpdates ? 'spin 1s linear infinite' : 'none' 
            }} />
            {isCheckingUpdates ? 'Проверка...' : 'Проверить обновления'}
          </UpdateButton>
        </Footer>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
