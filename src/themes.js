// Расширенная палитра тем для Media Tracker
export const themes = {
  // Классические темы
  light: {
    name: 'Светлая',
    id: 'light',
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
    cardHover: 'rgba(255, 255, 255, 0.8)',
    category: 'classic'
  },

  dark: {
    name: 'Тёмная',
    id: 'dark',
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
    cardHover: 'rgba(255, 255, 255, 0.05)',
    category: 'classic'
  },

  // Природные темы
  forest: {
    name: 'Лесная',
    id: 'forest',
    background: '#0f1419',
    surface: '#1a2332',
    surfaceSecondary: '#243447',
    text: '#e8f4f8',
    textSecondary: 'rgba(232, 244, 248, 0.8)',
    textTertiary: 'rgba(232, 244, 248, 0.6)',
    border: 'rgba(76, 175, 80, 0.2)',
    borderLight: 'rgba(76, 175, 80, 0.1)',
    accent: '#4caf50',
    accentGradient: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
    success: '#66bb6a',
    warning: '#ffa726',
    error: '#f44336',
    rating: '#ffeb3b',
    shadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(76, 175, 80, 0.1)',
    category: 'nature'
  },

  ocean: {
    name: 'Океан',
    id: 'ocean',
    background: '#0a1929',
    surface: '#132f4c',
    surfaceSecondary: '#1e3a5f',
    text: '#e3f2fd',
    textSecondary: 'rgba(227, 242, 253, 0.8)',
    textTertiary: 'rgba(227, 242, 253, 0.6)',
    border: 'rgba(33, 150, 243, 0.2)',
    borderLight: 'rgba(33, 150, 243, 0.1)',
    accent: '#2196f3',
    accentGradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    rating: '#ffeb3b',
    shadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(33, 150, 243, 0.1)',
    category: 'nature'
  },

  sunset: {
    name: 'Закат',
    id: 'sunset',
    background: '#1a0f0a',
    surface: '#2d1a0f',
    surfaceSecondary: '#40261a',
    text: '#fff3e0',
    textSecondary: 'rgba(255, 243, 224, 0.8)',
    textTertiary: 'rgba(255, 243, 224, 0.6)',
    border: 'rgba(255, 152, 0, 0.2)',
    borderLight: 'rgba(255, 152, 0, 0.1)',
    accent: '#ff9800',
    accentGradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    success: '#4caf50',
    warning: '#ffeb3b',
    error: '#f44336',
    rating: '#ffc107',
    shadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(255, 152, 0, 0.1)',
    category: 'nature'
  },

  // Яркие темы
  neon: {
    name: 'Неон',
    id: 'neon',
    background: '#0a0a0a',
    surface: '#1a0a1a',
    surfaceSecondary: '#2a0a2a',
    text: '#00ff88',
    textSecondary: 'rgba(0, 255, 136, 0.8)',
    textTertiary: 'rgba(0, 255, 136, 0.6)',
    border: 'rgba(0, 255, 136, 0.3)',
    borderLight: 'rgba(0, 255, 136, 0.1)',
    accent: '#00ff88',
    accentGradient: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
    success: '#00ff88',
    warning: '#ff0088',
    error: '#ff4444',
    rating: '#ffff00',
    shadow: 'rgba(0, 255, 136, 0.3)',
    cardHover: 'rgba(0, 255, 136, 0.1)',
    category: 'bright'
  },

  cyberpunk: {
    name: 'Киберпанк',
    id: 'cyberpunk',
    background: '#0a0a1a',
    surface: '#1a1a2e',
    surfaceSecondary: '#2a2a4e',
    text: '#ff6b9d',
    textSecondary: 'rgba(255, 107, 157, 0.8)',
    textTertiary: 'rgba(255, 107, 157, 0.6)',
    border: 'rgba(255, 107, 157, 0.3)',
    borderLight: 'rgba(255, 107, 157, 0.1)',
    accent: '#ff6b9d',
    accentGradient: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
    success: '#00d4aa',
    warning: '#ffd93d',
    error: '#ff4757',
    rating: '#ffd93d',
    shadow: 'rgba(255, 107, 157, 0.3)',
    cardHover: 'rgba(255, 107, 157, 0.1)',
    category: 'bright'
  },

  // Пастельные темы
  lavender: {
    name: 'Лаванда',
    id: 'lavender',
    background: '#f8f4ff',
    surface: '#ffffff',
    surfaceSecondary: '#f0e8ff',
    text: '#4a3c5c',
    textSecondary: '#6b5b7a',
    textTertiary: '#8a7a9a',
    border: '#e0d0f0',
    borderLight: '#f0e8ff',
    accent: '#9c27b0',
    accentGradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    rating: '#ffc107',
    shadow: 'rgba(156, 39, 176, 0.1)',
    cardHover: 'rgba(156, 39, 176, 0.05)',
    category: 'pastel'
  },

  mint: {
    name: 'Мята',
    id: 'mint',
    background: '#f0fdf4',
    surface: '#ffffff',
    surfaceSecondary: '#ecfdf5',
    text: '#1f2937',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
    border: '#d1fae5',
    borderLight: '#ecfdf5',
    accent: '#10b981',
    accentGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    rating: '#f59e0b',
    shadow: 'rgba(16, 185, 129, 0.1)',
    cardHover: 'rgba(16, 185, 129, 0.05)',
    category: 'pastel'
  },

  peach: {
    name: 'Персик',
    id: 'peach',
    background: '#fef7f0',
    surface: '#ffffff',
    surfaceSecondary: '#fef3e7',
    text: '#7c2d12',
    textSecondary: '#a16207',
    textTertiary: '#ca8a04',
    border: '#fed7aa',
    borderLight: '#fef3e7',
    accent: '#f97316',
    accentGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    rating: '#f59e0b',
    shadow: 'rgba(249, 115, 22, 0.1)',
    cardHover: 'rgba(249, 115, 22, 0.05)',
    category: 'pastel'
  },

  // Монохромные темы
  charcoal: {
    name: 'Уголь',
    id: 'charcoal',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    surfaceSecondary: '#404040',
    text: '#e5e5e5',
    textSecondary: 'rgba(229, 229, 229, 0.8)',
    textTertiary: 'rgba(229, 229, 229, 0.6)',
    border: 'rgba(229, 229, 229, 0.2)',
    borderLight: 'rgba(229, 229, 229, 0.1)',
    accent: '#e5e5e5',
    accentGradient: 'linear-gradient(135deg, #e5e5e5 0%, #b3b3b3 100%)',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    rating: '#ffeb3b',
    shadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(229, 229, 229, 0.1)',
    category: 'monochrome'
  },

  // Специальные темы
  matrix: {
    name: 'Матрица',
    id: 'matrix',
    background: '#000000',
    surface: '#001100',
    surfaceSecondary: '#002200',
    text: '#00ff00',
    textSecondary: 'rgba(0, 255, 0, 0.8)',
    textTertiary: 'rgba(0, 255, 0, 0.6)',
    border: 'rgba(0, 255, 0, 0.3)',
    borderLight: 'rgba(0, 255, 0, 0.1)',
    accent: '#00ff00',
    accentGradient: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    rating: '#ffff00',
    shadow: 'rgba(0, 255, 0, 0.3)',
    cardHover: 'rgba(0, 255, 0, 0.1)',
    category: 'special'
  },

  nord: {
    name: 'Nord',
    id: 'nord',
    background: '#2e3440',
    surface: '#3b4252',
    surfaceSecondary: '#434c5e',
    text: '#eceff4',
    textSecondary: 'rgba(236, 239, 244, 0.8)',
    textTertiary: 'rgba(236, 239, 244, 0.6)',
    border: 'rgba(88, 110, 117, 0.3)',
    borderLight: 'rgba(88, 110, 117, 0.1)',
    accent: '#88c0d0',
    accentGradient: 'linear-gradient(135deg, #88c0d0 0%, #5e81ac 100%)',
    success: '#a3be8c',
    warning: '#ebcb8b',
    error: '#bf616a',
    rating: '#ebcb8b',
    shadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(136, 192, 208, 0.1)',
    category: 'special'
  },

  // Новые градиентные темы
  aurora: {
    name: 'Северное сияние',
    id: 'aurora',
    background: '#0a0a0f',
    surface: '#1a1a2e',
    surfaceSecondary: '#2a2a4e',
    text: '#e8f4f8',
    textSecondary: 'rgba(232, 244, 248, 0.8)',
    textTertiary: 'rgba(232, 244, 248, 0.6)',
    border: 'rgba(138, 43, 226, 0.3)',
    borderLight: 'rgba(138, 43, 226, 0.1)',
    accent: '#8a2be2',
    accentGradient: 'linear-gradient(135deg, #8a2be2 0%, #4b0082 50%, #00bfff 100%)',
    success: '#00ff7f',
    warning: '#ffd700',
    error: '#ff6347',
    rating: '#ffd700',
    shadow: 'rgba(138, 43, 226, 0.3)',
    cardHover: 'rgba(138, 43, 226, 0.1)',
    category: 'gradient'
  },

  sunset_gradient: {
    name: 'Градиент заката',
    id: 'sunset_gradient',
    background: '#1a0f0a',
    surface: '#2d1a0f',
    surfaceSecondary: '#40261a',
    text: '#fff3e0',
    textSecondary: 'rgba(255, 243, 224, 0.8)',
    textTertiary: 'rgba(255, 243, 224, 0.6)',
    border: 'rgba(255, 152, 0, 0.3)',
    borderLight: 'rgba(255, 152, 0, 0.1)',
    accent: '#ff9800',
    accentGradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 50%, #e91e63 100%)',
    success: '#4caf50',
    warning: '#ffeb3b',
    error: '#f44336',
    rating: '#ffc107',
    shadow: 'rgba(255, 152, 0, 0.3)',
    cardHover: 'rgba(255, 152, 0, 0.1)',
    category: 'gradient'
  },

  ocean_gradient: {
    name: 'Градиент океана',
    id: 'ocean_gradient',
    background: '#0a1929',
    surface: '#132f4c',
    surfaceSecondary: '#1e3a5f',
    text: '#e3f2fd',
    textSecondary: 'rgba(227, 242, 253, 0.8)',
    textTertiary: 'rgba(227, 242, 253, 0.6)',
    border: 'rgba(33, 150, 243, 0.3)',
    borderLight: 'rgba(33, 150, 243, 0.1)',
    accent: '#2196f3',
    accentGradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #00bcd4 100%)',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    rating: '#ffeb3b',
    shadow: 'rgba(33, 150, 243, 0.3)',
    cardHover: 'rgba(33, 150, 243, 0.1)',
    category: 'gradient'
  },

  rainbow: {
    name: 'Радуга',
    id: 'rainbow',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceSecondary: '#2d2d2d',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textTertiary: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(255, 255, 255, 0.2)',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    accent: '#ff6b6b',
    accentGradient: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #feca57 100%)',
    success: '#4ecdc4',
    warning: '#feca57',
    error: '#ff6b6b',
    rating: '#feca57',
    shadow: 'rgba(255, 107, 107, 0.3)',
    cardHover: 'rgba(255, 107, 107, 0.1)',
    category: 'gradient'
  },

  galaxy: {
    name: 'Галактика',
    id: 'galaxy',
    background: '#0a0a0f',
    surface: '#1a1a2e',
    surfaceSecondary: '#2a2a4e',
    text: '#e8f4f8',
    textSecondary: 'rgba(232, 244, 248, 0.8)',
    textTertiary: 'rgba(232, 244, 248, 0.6)',
    border: 'rgba(138, 43, 226, 0.3)',
    borderLight: 'rgba(138, 43, 226, 0.1)',
    accent: '#8a2be2',
    accentGradient: 'linear-gradient(135deg, #8a2be2 0%, #4b0082 25%, #00bfff 50%, #ff1493 75%, #00ff7f 100%)',
    success: '#00ff7f',
    warning: '#ffd700',
    error: '#ff6347',
    rating: '#ffd700',
    shadow: 'rgba(138, 43, 226, 0.3)',
    cardHover: 'rgba(138, 43, 226, 0.1)',
    category: 'gradient'
  }
};

// Группировка тем по категориям
export const themeCategories = {
  classic: {
    name: 'Классические',
    themes: ['light', 'dark']
  },
  nature: {
    name: 'Природные',
    themes: ['forest', 'ocean', 'sunset']
  },
  bright: {
    name: 'Яркие',
    themes: ['neon', 'cyberpunk']
  },
  pastel: {
    name: 'Пастельные',
    themes: ['lavender', 'mint', 'peach']
  },
  monochrome: {
    name: 'Монохромные',
    themes: ['charcoal']
  },
  special: {
    name: 'Специальные',
    themes: ['matrix', 'nord']
  },
  gradient: {
    name: 'Градиентные',
    themes: ['aurora', 'sunset_gradient', 'ocean_gradient', 'rainbow', 'galaxy']
  }
};

// Функция для получения темы по ID
export const getTheme = (themeId) => {
  return themes[themeId] || themes.dark;
};

// Функция для получения всех тем
export const getAllThemes = () => {
  return Object.values(themes);
};

// Функция для получения тем по категории
export const getThemesByCategory = (category) => {
  return themeCategories[category]?.themes.map(id => themes[id]) || [];
};
