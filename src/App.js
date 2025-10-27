import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Film, Tv, Play, BookOpen, Search as SearchIconLucide, X, BarChart3, Sun, Moon, Tag, Filter, RefreshCw, Cloud, Database, Heart, Palette, Bell } from 'lucide-react';
import { APP_VERSION } from './version';
import debounce from 'lodash.debounce';
import { notificationService } from './lib/notificationService';
import { backgroundSyncService } from './lib/backgroundSyncService';

// Импортируем компоненты напрямую для отладки
import AddDialog from './components/AddDialog';
import MediaCard from './components/MediaCard';
import RatingDialog from './components/RatingDialog';
import Statistics from './components/Statistics';
import CloudSyncDialog from './components/CloudSyncDialog';
import BackupDialog from './components/BackupDialog';
import UpdateDialog from './components/UpdateDialog';
import UpdateButtonComponent from './components/UpdateButton';
import ThemeSelector from './components/ThemeSelector';
import VirtualizedMediaGrid from './components/VirtualizedMediaGrid';
import NotificationSettingsDialog from './components/NotificationSettingsDialog';

// Импортируем новую систему тем
import { themes, getTheme } from './themes';

/* ---------- ТЕМА ---------- */
// Старые темы удалены, теперь используем новую систему тем

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
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 16px 24px;
  background: ${p => p.theme.surface};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${p => p.theme.border};
  gap: 16px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    gap: 8px;
  }
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

const TabsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const TopTab = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 9999px;
  border: 1px solid ${p => p.theme.border};
  background: ${p => p.$active ? 
    'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 
    'transparent'};
  color: ${p => p.$active ? p.theme.text : p.theme.textSecondary};
  font-weight: 600;
  transition: all .3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(102, 126, 234, 0.05) 0%, 
      rgba(118, 75, 162, 0.05) 50%, 
      rgba(240, 147, 251, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    transform: translateY(-1px);
    
    &::before {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 8px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    gap: 6px;
    font-size: 13px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, ${p => p.theme.surfaceSecondary} 0%, ${p => p.theme.surface} 100%);
  border: 1px solid ${p => p.theme.border};
  border-radius: 9999px;
  padding: 8px 16px;
  flex: 1;
  min-width: 320px;
  transition: all .2s ease;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  
  &:focus-within {
    border-color: ${p => p.theme.accent};
    background: ${p => p.theme.surface};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), inset 0 1px 3px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 768px) {
    min-width: 280px;
    padding: 6px 12px;
  }
  
  @media (max-width: 480px) {
    min-width: 200px;
    padding: 6px 10px;
  }
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
  background:${p=>p.$selected ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'};
  border:1px solid ${p=>p.$selected ? '#667eea' : p.theme.border};
  border-radius:20px; color:${p=>p.$selected ? '#fff' : p.theme.text}; font-size:12px; font-weight:500; cursor:pointer; transition:.2s;
  box-shadow: ${p=>p.$selected ? '0 2px 8px rgba(102, 126, 234, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255,255,255,0.1) 0%, 
      rgba(255,255,255,0.05) 50%, 
      rgba(255,255,255,0.1) 100%);
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  &:hover{ 
    background:${p=>p.$selected ? 
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
      'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'};
    transform:translateY(-1px);
    box-shadow: ${p=>p.$selected ? '0 4px 12px rgba(102, 126, 234, 0.4)' : '0 2px 6px rgba(0,0,0,0.15)'};
    
    &::before {
      opacity: 1;
    }
  }
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
const ContentArea = styled(motion.div)`
  flex: 1;
  padding: clamp(16px, 2vw, 32px);
  overflow-y: auto;
  background: ${p => p.theme.background};
  transition: all .3s ease;
  
  @media (max-width: 768px) {
    padding: clamp(12px, 3vw, 20px);
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const StatusSection = styled(motion.div)`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`;

const StatusTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${p => p.theme.text};
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${p => p.theme.border};
    margin-left: 10px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 12px;
    gap: 6px;
  }
`;

const MediaGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  align-items: stretch;
  will-change: transform, opacity;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 18px;
  }
  
  @media (max-width: 1000px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 800px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const EmptyState = styled.div`
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  height:400px; text-align:center; color:${p=>p.theme.textTertiary};
  h3{ font-size:24px; margin-bottom:12px; font-weight:600; color:${p=>p.theme.text}; }
  p{ font-size:16px; margin-bottom:24px; }
`;
const SearchEmptyState = styled(EmptyState)` h3{ color:${p=>p.theme.accent}; }`;

const FloatingAddButton = styled(motion.button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  z-index: 1000;
  overflow: hidden;
  will-change: transform, box-shadow;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255,255,255,0.1) 0%, 
      rgba(255,255,255,0.05) 50%, 
      rgba(255,255,255,0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  &:hover { 
    transform: translateY(-2px) scale(1.1); 
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
    
    &::before {
      opacity: 1;
    }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

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
      (term === 'читаю' && item.status === 'watching' && item.type === 'manga') ||
      (term === 'просмотрено' && item.status === 'completed') ||
      (term === 'прочитано' && item.status === 'completed' && item.type === 'manga') ||
      (term === 'запланировано' && item.status === 'planned') ||
      (term === 'брошено' && item.status === 'dropped') ||
      (term === 'аниме' && item.type === 'anime') ||
      (term === 'фильм' && item.type === 'movie') ||
      (term === 'сериал' && item.type === 'series') ||
      (term === 'манга' && item.type === 'manga') ||
      (term === 'оценка' && item.rating > 0) ||
      (term === 'без' && item.rating === 0) ||
      (/^\d+\/10$/.test(term) && item.rating === parseInt(term)) ||
      (/^\d+$/.test(term) && item.rating === parseInt(term)) ||
      (term.startsWith('#') && item.tags && item.tags.some(t => t.toLowerCase().includes(term.slice(1))))
    );
  });
};


/* ---------- APP ---------- */
function App() {
  const [activeTab, setActiveTab] = useState('anime');
  const [media, setMedia] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [ratingDialog, setRatingDialog] = useState({ show: false, item: null });
  const [cloudSyncDialogOpen, setCloudSyncDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('not-available');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  

  // Debounced поиск
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Создаем debounced функцию для поиска
  const debouncedSetSearchQuery = useCallback(
    debounce((value) => {
      setDebouncedSearchQuery(value);
    }, 300),
    []
  );

  // Обновляем debounced поиск при изменении обычного поиска
  useEffect(() => {
    debouncedSetSearchQuery(searchQuery);
  }, [searchQuery, debouncedSetSearchQuery]);

  const { isOnline, isStandalone, showInstallPrompt, installPWA, dismissInstallPrompt } = usePWA();

  useEffect(() => {
    loadMediaData();
    const savedTheme = localStorage.getItem('tracker-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    
    // Инициализация сервисов уведомлений и фоновой синхронизации
    const initializeServices = async () => {
      try {
        // Запрашиваем разрешение на уведомления
        await notificationService.requestPermission();
        
        // Настраиваем связь между сервисами
        backgroundSyncService.setNotificationService(notificationService);
        
        // Запускаем сервис уведомлений
        notificationService.start(media);
        
        // Запускаем фоновую синхронизацию
        backgroundSyncService.start(media);
        
        console.log('Notification and background sync services initialized');
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };
    
    initializeServices();
    
    // Очистка при размонтировании
    return () => {
      notificationService.stop();
      backgroundSyncService.stop();
    };
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      const handleUpdateStatus = (event, data) => {
        console.log('Update status received:', data);
        
        switch (data.type) {
          case 'update-available':
            setUpdateInfo({ version: data.version });
            setUpdateStatus('available');
            setIsCheckingUpdates(false);
            break;
          case 'update-not-available':
            setUpdateStatus('not-available');
            setIsCheckingUpdates(false);
            break;
          case 'download-progress':
            setUpdateStatus('downloading');
            setDownloadProgress(data.percent || 0);
            break;
          case 'update-downloaded':
            setUpdateStatus('downloaded');
            break;
          case 'error':
            setUpdateStatus('error');
            setIsCheckingUpdates(false);
            console.error('Update error:', data.error);
            break;
          default:
            console.log('Unknown update event:', data.type);
        }
      };

      window.electronAPI.onUpdateStatus(handleUpdateStatus);
      
      return () => {
        if (window.electronAPI?.removeUpdateStatusListener) {
          window.electronAPI.removeUpdateStatusListener(handleUpdateStatus);
        }
      };
    }
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('tracker-theme', themeId);
  };

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    handleThemeChange(nextTheme);
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

  const saveMediaData = useCallback(async (newMedia) => {
    try {
      setMedia(newMedia);
      if (window.electronAPI) await window.electronAPI.writeMediaData(newMedia);
      else localStorage.setItem('media-data', JSON.stringify(newMedia));
      
      // Обновляем сервисы с новыми данными
      if (notificationService.isRunning) {
        notificationService.start(newMedia);
      }
      if (backgroundSyncService.isRunning) {
        backgroundSyncService.start(newMedia);
      }
    } catch (e) { console.error('Error saving media data:', e); }
  }, []);

  // Функция для проверки, должен ли тайтл быть отслеживаемым
  const shouldTrackTitle = useCallback((item) => {
    // Отслеживаем только аниме и мангу со статусом "watching" (Смотрю/Читаю)
    if (item.type !== 'anime' && item.type !== 'manga') return false;
    if (item.status !== 'watching') return false;
    
    // Проверяем, есть ли URL Shikimori для получения статуса выпуска
    // Используем apiUrl (из API) или url (пользовательская ссылка)
    const shikimoriUrl = item.apiUrl || item.url;
    if (!shikimoriUrl || !shikimoriUrl.includes('shikimori.one')) return false;
    
    return true;
  }, []);

  // Функция для получения отслеживаемых тайтлов
  const getTrackableTitles = useCallback((mediaItems) => {
    return mediaItems.filter(shouldTrackTitle);
  }, [shouldTrackTitle]);

  const addMediaItem = useCallback((item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      rating: item.rating || 0,
      comment: item.comment || '',
      tags: item.tags || []
    };
    const newMedia = [...media, newItem];
    
    // Проверяем, нужно ли добавить новый тайтл в отслеживаемые
    if (shouldTrackTitle(newItem)) {
      const trackableTitles = getTrackableTitles(newMedia);
      notificationService.updateSettings(notificationService.notificationSettings, trackableTitles);
      backgroundSyncService.updateSettings(backgroundSyncService.settings, trackableTitles);
    }
    
    saveMediaData(newMedia);
  }, [media, saveMediaData, shouldTrackTitle, getTrackableTitles]);

  const updateMediaItem = useCallback((id, updates) => {
    const oldItem = media.find(item => item.id === id);
    const newMedia = media.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, ...updates };
      if (updates.watchedEpisodes !== undefined && item.totalEpisodes && updates.watchedEpisodes >= item.totalEpisodes) {
        next.status = 'completed';
        if (!item.rating) setTimeout(() => setRatingDialog({ show: true, item: next }), 500);
      }
      return next;
    });
    
    // Проверяем изменения в отслеживании
    const wasTrackable = oldItem ? shouldTrackTitle(oldItem) : false;
    const isTrackable = shouldTrackTitle({ ...oldItem, ...updates });
    
    // Если статус изменился с/на отслеживаемый, обновляем сервисы уведомлений
    if (wasTrackable !== isTrackable) {
      const trackableTitles = getTrackableTitles(newMedia);
      notificationService.updateSettings(notificationService.notificationSettings, trackableTitles);
      backgroundSyncService.updateSettings(backgroundSyncService.settings, trackableTitles);
    }
    
    saveMediaData(newMedia);
  }, [media, saveMediaData, shouldTrackTitle, getTrackableTitles]);

  const deleteMediaItem = useCallback((id) => {
    const itemToDelete = media.find(item => item.id === id);
    const newMedia = media.filter(i => i.id !== id);
    
    // Если удаляемый тайтл был отслеживаемым, обновляем сервисы
    if (itemToDelete && shouldTrackTitle(itemToDelete)) {
      const trackableTitles = getTrackableTitles(newMedia);
      notificationService.updateSettings(notificationService.notificationSettings, trackableTitles);
      backgroundSyncService.updateSettings(backgroundSyncService.settings, trackableTitles);
    }
    
    saveMediaData(newMedia);
  }, [media, saveMediaData, shouldTrackTitle, getTrackableTitles]);
  const editMediaItem = useCallback((item) => setEditingItem(item), []);
  const saveEditedItem = useCallback((updated) => { 
    const oldItem = media.find(item => item.id === updated.id);
    const newMedia = media.map(i => i.id === updated.id ? updated : i);
    
    // Проверяем изменения в отслеживании при редактировании
    const wasTrackable = oldItem ? shouldTrackTitle(oldItem) : false;
    const isTrackable = shouldTrackTitle(updated);
    
    if (wasTrackable !== isTrackable) {
      const trackableTitles = getTrackableTitles(newMedia);
      notificationService.updateSettings(notificationService.notificationSettings, trackableTitles);
      backgroundSyncService.updateSettings(backgroundSyncService.settings, trackableTitles);
    }
    
    saveMediaData(newMedia); 
    setEditingItem(null); 
  }, [media, saveMediaData, shouldTrackTitle, getTrackableTitles]);
  const handleRatingSave = useCallback((id, rating, comment) => { 
    updateMediaItem(id, { rating, comment }); 
    setRatingDialog({ show: false, item: null }); 
  }, [updateMediaItem]);
  const clearSearch = () => setSearchQuery('');

  
  const checkForUpdates = async () => {
    if (isCheckingUpdates) return;
    
    setIsCheckingUpdates(true);
    setUpdateStatus('checking');
    
    try {
      if (window.electronAPI?.checkForUpdates) {
        await window.electronAPI.checkForUpdates();
        // Результат будет получен через событие 'update-status'
        // Не устанавливаем статус здесь, ждем события
      } else {
        console.log('Electron API not available');
        setUpdateStatus('error');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateStatus('error');
    } finally {
      setTimeout(() => setIsCheckingUpdates(false), 2000);
    }
  };

  const downloadUpdate = async () => {
    try {
      setUpdateStatus('downloading');
      const result = await window.electronAPI.downloadUpdate();
      
      if (result.success) {
        // Статус будет обновлен через событие 'update-downloaded'
        console.log('Download started successfully');
      } else {
        setUpdateStatus('error');
        console.error('Download error:', result.error);
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      setUpdateStatus('error');
    }
  };

  const installUpdate = async () => {
    try {
      const result = await window.electronAPI.installUpdate();
      if (!result.success) {
        console.error('Install error:', result.error);
      }
    } catch (error) {
      console.error('Error installing update:', error);
    }
  };

  const toggleTag = useCallback((tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]), []);
  const clearFilters = useCallback(() => { setSelectedTags([]); setSearchQuery(''); }, []);

  // Мемоизируем вычисление тегов
  const allTags = useMemo(() => {
    const counts = (media.flatMap(i => i.tags || [])).reduce((acc, t) => (acc[t] = (acc[t] || 0) + 1, acc), {});
    return Object.entries(counts).sort(([,a],[,b]) => b - a).map(([tag, count]) => ({ tag, count }));
  }, [media]);

  // Мемоизируем фильтрацию
  const filteredByTab = useMemo(() => 
    media.filter(item => item.type === activeTab), 
    [media, activeTab]
  );

  const searchedMedia = useMemo(() => 
    smartSearch(filteredByTab, debouncedSearchQuery, selectedTags), 
    [filteredByTab, debouncedSearchQuery, selectedTags]
  );

  const favoritesApplied = useMemo(() => 
    showFavoritesOnly
      ? searchedMedia.filter(item => item.favorite === true)
      : searchedMedia,
    [searchedMedia, showFavoritesOnly]
  );

  // Определяем, нужно ли использовать виртуализацию (для коллекций больше 50 элементов)
  const shouldUseVirtualization = useMemo(() => {
    return favoritesApplied.length > 50;
  }, [favoritesApplied.length]);

  const mediaByStatus = useMemo(() => ({
    watching: favoritesApplied.filter(item => item.status === 'watching'),
    planned:  favoritesApplied.filter(item => item.status === 'planned'),
    completed:favoritesApplied.filter(item => item.status === 'completed'),
    dropped:  favoritesApplied.filter(item => item.status === 'dropped')
  }), [favoritesApplied]);

  const hasSearchResults = searchedMedia.length > 0;
  const hasAnyMedia = filteredByTab.length > 0;
  const isSearching = debouncedSearchQuery.trim().length > 0 || selectedTags.length > 0;

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
            <div style={{fontWeight:600, marginBottom:4}}>Установить Media Tracker</div>
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

  // Функция для рендеринга виртуализированной сетки
  const renderVirtualizedGrid = (items) => {
    if (shouldUseVirtualization) {
      return (
        <VirtualizedMediaGrid
          items={items}
          onUpdate={updateMediaItem}
          onDelete={deleteMediaItem}
          onEdit={editMediaItem}
          currentTheme={currentTheme}
        />
      );
    }
    return null;
  };

  // Функция для рендеринга обычной сетки
  const renderRegularGrid = (items) => {
    return (
      <MediaGrid
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              ease: "easeOut"
            }}
          >
            <MediaCard
              item={item}
              onUpdate={updateMediaItem}
              onDelete={deleteMediaItem}
              onEdit={editMediaItem}
              currentTheme={currentTheme}
            />
          </motion.div>
        ))}
      </MediaGrid>
    );
  };

  const content = () => {
    if (activeTab === 'statistics') return (
      <Statistics media={media} currentTheme={currentTheme} />
    );

    if (hasSearchResults) {
      return (
        <>
          {Object.entries(mediaByStatus).map(([status, items]) =>
            items.length > 0 && (
              <StatusSection 
                key={status}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <StatusTitle>
                  {statusConfig[status].title}
                  <span style={{ fontSize:14, opacity:.6, marginLeft:8 }}>({items.length})</span>
                  {shouldUseVirtualization && (
                    <span style={{ fontSize:12, opacity:.5, marginLeft:8, color: getTheme(currentTheme).accent }}>
                      Виртуализировано
                    </span>
                  )}
                </StatusTitle>
                {renderVirtualizedGrid(items) || renderRegularGrid(items)}
              </StatusSection>
            )
          )}
        </>
      );
    }

    if (isSearching) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SearchEmptyState>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить запрос или очистить фильтры</p>
            <p style={{ fontSize:14, opacity:.7 }}>
              {selectedTags.length > 0 && `Выбранные теги: ${selectedTags.join(', ')}`}
            </p>
          </SearchEmptyState>
        </motion.div>
      );
    }

    if (hasAnyMedia) {
      return (
        <>
          {Object.entries(mediaByStatus).map(([status, items]) =>
            items.length > 0 && (
              <StatusSection 
                key={status}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <StatusTitle>
                  {statusConfig[status].title}
                  {shouldUseVirtualization && (
                    <span style={{ fontSize:12, opacity:.5, marginLeft:8, color: getTheme(currentTheme).accent }}>
                      Виртуализировано
                    </span>
                  )}
                </StatusTitle>
                {renderVirtualizedGrid(items) || renderRegularGrid(items)}
              </StatusSection>
            )
          )}
        </>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <EmptyState>
          <h3>Пока ничего нет</h3>
          <p>Может пора уже что-то добавить?</p>
        </EmptyState>
      </motion.div>
    );
  };

  return (
    <ThemeProvider theme={getTheme(currentTheme)}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <TabsRow>
            <TopTab 
              $active={activeTab === 'anime'} 
              onClick={() => setActiveTab('anime')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Film size={18}/>Аниме
            </TopTab>
            <TopTab 
              $active={activeTab === 'movie'} 
              onClick={() => setActiveTab('movie')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Play size={18}/>Фильмы
            </TopTab>
            <TopTab 
              $active={activeTab === 'series'} 
              onClick={() => setActiveTab('series')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Tv size={18}/>Сериалы
            </TopTab>
            <TopTab 
              $active={activeTab === 'manga'} 
              onClick={() => setActiveTab('manga')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <BookOpen size={18}/>Манга
            </TopTab>
          </TabsRow>

          <SearchContainer style={{ visibility: activeTab === 'statistics' ? 'hidden' : 'visible' }}>
            <SearchIcon size={20}/>
            <SearchInput
              type="text"
              placeholder="Поиск по названию, тегам"
              value={searchQuery}
              onChange={(e)=>setSearchQuery(e.target.value)}
              style={{ 
                opacity: searchQuery !== debouncedSearchQuery ? 0.7 : 1,
                transition: 'opacity 0.2s ease'
              }}
            />
            {searchQuery !== debouncedSearchQuery && (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid transparent',
                borderTop: `2px solid ${getTheme(currentTheme).accent}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {searchQuery && (
              <ClearSearchButton onClick={clearSearch} title="Очистить поиск">
                <X size={16}/>
              </ClearSearchButton>
            )}
            <SearchActionButton
              onClick={()=>setShowFavoritesOnly(v=>!v)}
              $active={showFavoritesOnly}
              title={showFavoritesOnly ? 'Показывать всё' : 'Только избранное'}
              style={{marginLeft:4}}
            >
              <Heart size={18} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            </SearchActionButton>
          </SearchContainer>

          <HeaderControls>

                   <IconButton className="info" onClick={() => setActiveTab('statistics')} title="Статистика">
                     <BarChart3 size={20}/>
                   </IconButton>

                   {typeof window !== 'undefined' && window.electronAPI && (
                     <IconButton className="info" onClick={() => {
                       console.log('App: Opening CloudSyncDialog');
                       setCloudSyncDialogOpen(true);
                     }} title="Облачная синхронизация"><Cloud size={20}/></IconButton>
                   )}

                   {typeof window !== 'undefined' && window.electronAPI && (
                     <IconButton className="warning" onClick={() => {
                       console.log('App: Opening BackupDialog');
                       setBackupDialogOpen(true);
                     }} title="Управление бэкапами"><Database size={20}/></IconButton>
                   )}

            <IconButton className="info" onClick={() => setShowThemeSelector(true)} title="Выбор темы">
              <Palette size={20}/>
            </IconButton>

            <IconButton className="info" onClick={() => setNotificationDialogOpen(true)} title="Настройки уведомлений">
              <Bell size={20}/>
            </IconButton>

                   {typeof window !== 'undefined' && window.electronAPI && (
                     <UpdateButtonComponent 
                       currentVersion={APP_VERSION}
                       updateStatus={updateStatus}
                       downloadProgress={downloadProgress}
                       updateInfo={updateInfo}
                       onClick={() => setUpdateDialogOpen(true)}
                       theme={getTheme(currentTheme)}
                     />
                   )}
          </HeaderControls>
        </Header>

        {/* Старая полоса вкладок убрана, но оставлена в коде на будущее */}
        <TabsContainer />

        {activeTab !== 'statistics' && allTags.length > 0 && (
          <FiltersContainer>
            <FilterLabel><Filter size={16}/>Теги:</FilterLabel>
            <TagsContainer>
              {allTags.slice(0, 10).map(({ tag, count }) => (
                <TagChip key={tag} $selected={selectedTags.includes(tag)} onClick={()=>toggleTag(tag)} title={`${count} тайтл(ов)`}>
                  <Tag size={12} />{tag}<TagCount $selected={selectedTags.includes(tag)}>{count}</TagCount>
                </TagChip>
              ))}
              {allTags.length > 10 && <TagChip $selected={false}>+{allTags.length - 10} еще...</TagChip>}
            </TagsContainer>
            {(selectedTags.length > 0 || searchQuery) && (
              <ClearFiltersButton onClick={clearFilters}><X size={14}/>Очистить</ClearFiltersButton>
            )}
          </FiltersContainer>
        )}

        <MainContent>
          <ContentArea
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              {content()}
            </AnimatePresence>
          </ContentArea>
        </MainContent>

      

        <FloatingAddButton 
          onClick={()=>setShowAddDialog(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            delay: 0.2 
          }}
          title="Добавить новый тайтл"
        >
          <Plus size={24}/>
        </FloatingAddButton>

        {showAddDialog && (
          <AddDialog onClose={()=>setShowAddDialog(false)} onSave={addMediaItem} currentTheme={currentTheme} />
        )}

        {editingItem && (
          <AddDialog item={editingItem} onClose={()=>setEditingItem(null)} onSave={saveEditedItem} currentTheme={currentTheme} />
        )}

        {ratingDialog.show && (
          <RatingDialog item={ratingDialog.item} onClose={()=>setRatingDialog({show:false, item:null})} onSave={handleRatingSave} currentTheme={currentTheme} />
        )}


        {window.electronAPI && cloudSyncDialogOpen && (
          <CloudSyncDialog open={cloudSyncDialogOpen} onClose={() => {
            console.log('App: Closing CloudSyncDialog');
            setCloudSyncDialogOpen(false);
          }} currentTheme={currentTheme} />
        )}

        {window.electronAPI && backupDialogOpen && (
          <BackupDialog open={backupDialogOpen} onClose={() => {
            console.log('App: Closing BackupDialog');
            setBackupDialogOpen(false);
          }} currentTheme={currentTheme} />
        )}

        {window.electronAPI && updateDialogOpen && (
          <UpdateDialog 
            open={updateDialogOpen} 
            onClose={() => {
              console.log('App: Closing UpdateDialog');
              setUpdateDialogOpen(false);
            }} 
            currentTheme={currentTheme}
            currentVersion={APP_VERSION}
            updateInfo={updateInfo}
            updateStatus={updateStatus}
            downloadProgress={downloadProgress}
            onCheckUpdates={checkForUpdates}
            onDownloadUpdate={downloadUpdate}
            onInstallUpdate={installUpdate}
          />
        )}

        {renderInstallPrompt()}

        <ThemeSelector
          isOpen={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          isDarkMode={currentTheme === 'dark'}
        />

        <NotificationSettingsDialog
          isOpen={notificationDialogOpen}
          onClose={() => setNotificationDialogOpen(false)}
          currentTheme={currentTheme}
          mediaItems={media}
        />

      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
