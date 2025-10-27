import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Trash2, Edit3, Plus, Minus, Star, ExternalLink, Tag as TagIcon, AlertTriangle, X, Heart, Play, CheckCircle, Clock, Calendar } from 'lucide-react';
import { checkTitleStatus } from '../lib/ruSources';

/** ============== Layout constants ============== */
// Адаптивные размеры для разных экранов
const CARD_SIZES = {
  desktop: { 
    posterWidth: 120, 
    minHeight: 220, 
    padding: 16, 
    gap: 16,
    borderRadius: 16,
    fontSize: { title: 16, meta: 12, rating: 12 }
  },
  tablet: { 
    posterWidth: 100, 
    minHeight: 200, 
    padding: 14, 
    gap: 14,
    borderRadius: 16,
    fontSize: { title: 15, meta: 12, rating: 12 }
  },
  mobile: { 
    posterWidth: 80, 
    minHeight: 180, 
    padding: 12, 
    gap: 12,
    borderRadius: 14,
    fontSize: { title: 14, meta: 11, rating: 11 }
  },
  small: { 
    posterWidth: 60, 
    minHeight: 160, 
    padding: 10, 
    gap: 10,
    borderRadius: 12,
    fontSize: { title: 13, meta: 10, rating: 10 }
  }
};

// Функция для получения размеров в зависимости от ширины экрана
const getCardSizes = (screenWidth) => {
  if (screenWidth >= 1200) return CARD_SIZES.desktop;
  if (screenWidth >= 768) return CARD_SIZES.tablet;
  if (screenWidth >= 480) return CARD_SIZES.mobile;
  return CARD_SIZES.small;
};

/** ============== Card shell ============== */
const CardContainer = styled(motion.div)`
  width: 100%;
  perspective: 1000px;
`;

const Card = styled(motion.div)`
  width: 100%;
  min-height: ${p => p.$sizes?.minHeight || 200}px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
  transform: ${p => p.$flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
  will-change: transform;
`;

const CardFace = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: ${p => p.$sizes?.minHeight || 200}px;
  backface-visibility: hidden;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.$sizes?.borderRadius || 16}px;
  box-shadow: 0 6px 16px ${p => p.theme.shadow};
  overflow: hidden;
  transition: border-color .15s ease, box-shadow .15s ease;

  &:hover {
    border-color: ${p => p.theme.accent};
    box-shadow: 0 10px 24px ${p => p.theme.shadow};
  }
`;

const CardFront = styled(CardFace)`
  transform: rotateY(0deg);
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$sizes?.posterWidth || 100}px 1fr;
  gap: ${p => p.$sizes?.gap || 14}px;
  padding: ${p => p.$sizes?.padding || 14}px;
  align-items: stretch;
  height: 100%;
  > * { min-width: 0; }

  @media (max-width: 1200px) {
    grid-template-columns: ${p => p.$sizes?.posterWidth >= 120 ? 100 : p.$sizes?.posterWidth || 100}px 1fr;
    gap: ${p => p.$sizes?.gap >= 16 ? 14 : p.$sizes?.gap || 14}px;
    padding: ${p => p.$sizes?.padding >= 16 ? 14 : p.$sizes?.padding || 14}px;
  }

  @media (max-width: 768px) {
    grid-template-columns: ${p => p.$sizes?.posterWidth >= 100 ? 80 : p.$sizes?.posterWidth || 80}px 1fr;
    gap: ${p => p.$sizes?.gap >= 14 ? 12 : p.$sizes?.gap || 12}px;
    padding: ${p => p.$sizes?.padding >= 14 ? 12 : p.$sizes?.padding || 12}px;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: ${p => p.$sizes?.gap >= 12 ? 10 : p.$sizes?.gap || 10}px;
    padding: ${p => p.$sizes?.padding >= 12 ? 10 : p.$sizes?.padding || 10}px;
  }

  @media (max-width: 480px) {
    gap: ${p => p.$sizes?.gap >= 10 ? 8 : p.$sizes?.gap || 8}px;
    padding: ${p => p.$sizes?.padding >= 10 ? 8 : p.$sizes?.padding || 8}px;
  }
`;

const Poster = styled.div`
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${p => p.theme.border};
  background: linear-gradient(180deg, rgba(148,163,184,.18), rgba(148,163,184,.08));
  display: grid; 
  place-items: center;
  align-self: start;

  img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
    object-position: center;
    display: block; 
  }

  &::after {
    content: attr(data-empty);
    display: ${p => p['data-has'] ? 'none' : 'block'};
    font-size: 12px; color: ${p => p.theme.textSecondary};
    padding: 6px 10px; text-align: center;
  }
`;

/** ============== Right content ============== */
const Right = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
`;

const Header = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
  
  @media (max-width: 400px) {
    gap: 6px;
  }
`;

const Title = styled.h3`
  margin: 0;
  color: ${p => p.theme.text};
  font-size: ${p => p.$sizes?.fontSize?.title || 16}px;
  font-weight: 800;
  cursor: ${p => (p.$hasUrl ? 'pointer' : 'default')};
  display: inline-flex; align-items: center; gap: 6px;
  line-height: 1.25;
  overflow-wrap: anywhere;
  flex: 1;
  min-width: 0;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover { color: ${p => (p.$hasUrl ? p.theme.accent : p.theme.text)}; }

  @media (max-width: 1200px) {
    font-size: ${p => p.$sizes?.fontSize?.title >= 16 ? 15 : p.$sizes?.fontSize?.title || 15}px;
  }

  @media (max-width: 768px) {
    font-size: ${p => p.$sizes?.fontSize?.title >= 15 ? 14 : p.$sizes?.fontSize?.title || 14}px;
  }

  @media (max-width: 480px) {
    font-size: ${p => p.$sizes?.fontSize?.title >= 14 ? 13 : p.$sizes?.fontSize?.title || 13}px;
    gap: 4px;
  }
`;

const TypeBadge = styled.span`
  background: rgba(102, 126, 234, 0.18);
  color: #90a5ff;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  line-height: 1;
`;

const MetaRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
  
  @media (max-width: 400px) {
    gap: 8px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Meta = styled.div`
  display: flex; align-items: center; gap: 8px;
  color: ${p => p.theme.textSecondary};
  font-size: ${p => p.$sizes?.fontSize?.meta || 12}px;
  flex-wrap: wrap;
  
  span[data-no-bullet]::before {
    content: none !important;
  }
  
  span:not(:first-child):not([data-no-bullet])::before {
    content: "•";
    margin: 0 6px;
    color: ${p => p.theme.textSecondary};
    opacity: .65;
  }

  @media (max-width: 1200px) {
    font-size: ${p => p.$sizes?.fontSize?.meta >= 12 ? 12 : p.$sizes?.fontSize?.meta || 12}px;
  }

  @media (max-width: 768px) {
    font-size: ${p => p.$sizes?.fontSize?.meta >= 12 ? 11 : p.$sizes?.fontSize?.meta || 11}px;
  }

  @media (max-width: 480px) {
    font-size: ${p => p.$sizes?.fontSize?.meta >= 11 ? 10 : p.$sizes?.fontSize?.meta || 10}px;
    gap: 6px;
  }
`;

const StatusDot = styled.span`
  display: inline-block; width: 8px; height: 8px; border-radius: 999px; margin-right: 6px;
  background: ${p => p.$color || '#9ca3af'};
`;

const ReleaseStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  
  ${props => props.$status === 'ongoing' && `
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  `}
  
  ${props => props.$status === 'completed' && `
    background: rgba(102, 126, 234, 0.15);
    color: #667eea;
    border: 1px solid rgba(102, 126, 234, 0.3);
  `}
  
  ${props => props.$status === 'anons' && `
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
  `}
  
  ${props => props.$status === 'released' && `
    background: rgba(156, 163, 175, 0.15);
    color: #9ca3af;
    border: 1px solid rgba(156, 163, 175, 0.3);
  `}
`;

const StatusSelect = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: linear-gradient(135deg, ${p => p.theme.background} 0%, ${p => p.theme.surfaceSecondary} 100%);
  color: ${p => p.theme.text};
  border: 1px solid ${p => p.theme.border};
  border-radius: 6px;
  padding: 6px 30px 6px 10px;
  font-size: 11px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 120px;
  
  /* Custom arrow */
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  
  &:hover {
    background: linear-gradient(135deg, ${p => p.theme.surface} 0%, ${p => p.theme.accent} 100%);
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    color: white;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }
  
  &:focus { 
    border-color: ${p => p.theme.accent}; 
    background: linear-gradient(135deg, ${p => p.theme.surface} 0%, ${p => p.theme.accent} 100%);
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    color: white;
  }
  
  option {
    background: ${p => p.theme.surface};
    color: ${p => p.theme.text};
  }
  
  @media (max-width: 400px) {
    padding: 4px 28px 4px 8px;
    font-size: 10px;
    min-width: 100px;
  }
`;


/** ============== Rating ============== */
const RatingRow = styled.div`
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  
  @media (max-width: 400px) {
    gap: 6px;
  }
`;
const Stars = styled.div` 
  display: flex; 
  gap: 2px; 
  
  @media (max-width: 400px) {
    gap: 1px;
  }
`;
const StarBtn = styled(motion.button)`
  background: none; border: none; padding: 0 1px; cursor: pointer;
  color: ${p => (p.$active ? '#f59e0b' : p.theme.textSecondary)};
  &:hover { color: #f59e0b; }
  transition: color .2s ease;
  
  @media (max-width: 400px) {
    padding: 0;
  }
`;
const RatingText = styled.span`
  font-size: ${p => p.$sizes?.fontSize?.rating || 12}px; 
  color: ${p => p.theme.textSecondary}; 
  font-weight: 700;
  
  @media (max-width: 1200px) {
    font-size: ${p => p.$sizes?.fontSize?.rating >= 12 ? 12 : p.$sizes?.fontSize?.rating || 12}px;
  }

  @media (max-width: 768px) {
    font-size: ${p => p.$sizes?.fontSize?.rating >= 12 ? 11 : p.$sizes?.fontSize?.rating || 11}px;
  }

  @media (max-width: 480px) {
    font-size: ${p => p.$sizes?.fontSize?.rating >= 11 ? 10 : p.$sizes?.fontSize?.rating || 10}px;
  }
`;

/** ============== Progress ============== */
const ProgressRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  
  @media (max-width: 400px) {
    gap: 6px;
    grid-template-columns: 1fr auto;
    
    > div:last-child {
      grid-column: 1 / -1;
      justify-self: end;
      margin-top: 4px;
    }
  }
`;

const Bar = styled.div`
  position: relative;
  height: 6px; border-radius: 999px;
  background: rgba(148,163,184,.25);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
`;
const Fill = styled.div`
  position: absolute; left: 0; top: 0; bottom: 0;
  width: ${p => p.$w || 0}%;
  background: ${p => {
    if (p.$w >= 100) return 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
    if (p.$w >= 75) return 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)';
    if (p.$w >= 40) return 'linear-gradient(135deg, #facc15 0%, #eab308 100%)';
    return 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
  }};
  transition: width .2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255,255,255,0.3) 50%, 
      transparent 100%);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const Pct = styled.span`
  width: 46px; text-align: right; font-size: 12px; color: ${p => p.theme.textSecondary}; font-weight: 800;
`;

const Round = styled(motion.button)`
  width: 24px; height: 24px; display: grid; place-items: center;
  border-radius: 999px; border: 1px solid ${p => p.theme.border};
  background: linear-gradient(135deg, ${p => p.theme.surfaceSecondary} 0%, ${p => p.theme.surface} 100%);
  color: ${p => p.theme.text};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover { 
    background: linear-gradient(135deg, ${p => p.theme.surface} 0%, ${p => p.theme.accent} 100%);
    color: white;
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }
`;

/** ============== Bottom actions / tags ============== */
const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid ${p => p.theme.border};
  flex-shrink: 0;
  gap: 10px;
  
  @media (max-width: 400px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding-top: 10px;
  }
`;


const IconActions = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;
  position: relative;
  
  @media (max-width: 400px) {
    gap: 6px;
    justify-content: center;
  }
`;

const GhostBtn = styled(motion.button)`
  border: 1px solid ${p => p.theme.border};
  background: linear-gradient(135deg, ${p => p.theme.background} 0%, ${p => p.theme.surfaceSecondary} 100%);
  color: ${p => p.theme.text};
  padding: 6px; border-radius: 6px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &.danger { 
    color: #ef4444; 
    border-color: #ef4444; 
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  }
  
  &:hover { 
    background: linear-gradient(135deg, ${p => p.theme.surface} 0%, ${p => p.theme.accent} 100%);
    color: white;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }
  
  &.danger:hover {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
  }
  
  font-size: 11px; white-space: nowrap;
  width: 28px; height: 28px;
  
  @media (max-width: 400px) {
    width: 24px; height: 24px;
    padding: 4px;
  }
`;

/** ============== Delete Confirmation ============== */
const WarningContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 20px;
  text-align: center;
`;

const WarningIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
`;

const WarningText = styled.p`
  font-size: 14px;
  color: ${p => p.theme.textSecondary};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 100%;
`;

const ConfirmBtn = styled(motion.button)`
  flex: 1;
  max-width: 100px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s ease;
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
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  &.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
      
      &::before {
        opacity: 1;
      }
    }
  }

  &.secondary {
    background: linear-gradient(135deg, ${p => p.theme.surface} 0%, ${p => p.theme.surfaceSecondary} 100%);
    color: ${p => p.theme.text};
    border: 1px solid ${p => p.theme.border};
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);

    &:hover {
      background: linear-gradient(135deg, ${p => p.theme.background} 0%, ${p => p.theme.surface} 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px ${p => p.theme.shadow};
      
      &::before {
        opacity: 1;
      }
    }
  }
`;

/** ============== Helpers ============== */
const statusLabel = { planned: 'Запланировано', watching: 'Смотрю', completed: 'Просмотрено', dropped: 'Брошено' };
const getStatusLabel = (status, type) => {
  if (type === 'manga' && status === 'watching') return 'Читаю';
  if (type === 'manga' && status === 'completed') return 'Прочитано';
  return statusLabel[status];
};
const typeLabel   = { anime: 'Аниме', movie: 'Фильм',  series: 'Сериал', manga: 'Манга' };
const statusColor = (s) => ({ watching:'#22c55e', planned:'#3b82f6', dropped:'#ef4444', completed:'#9ca3af' }[s] || '#9ca3af');

/** ============== LazyImage Component ============== */
const LazyImage = React.memo(({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} style={{ width: '100%', height: '100%' }}>
      {isInView && (
        <img 
          src={src} 
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ 
            opacity: isLoaded ? 1 : 0, 
            transition: 'opacity 0.3s ease',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block'
          }}
          {...props}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

/** ============== Component ============== */
const MediaCard = React.memo(({ item, onUpdate, onDelete, onEdit, currentTheme }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [releaseStatus, setReleaseStatus] = useState(null);
  const [isCheckingReleaseStatus, setIsCheckingReleaseStatus] = useState(false);
  // Отслеживаем изменение размера экрана
  React.useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Проверяем статус выпуска для аниме и манги
  React.useEffect(() => {
    const checkReleaseStatus = async () => {
      // Проверяем только аниме и мангу, и только если есть Shikimori ID в URL
      const shikimoriUrl = item.apiUrl || item.url; // Используем apiUrl или url
      
      if ((item.type === 'anime' || item.type === 'manga') && shikimoriUrl && shikimoriUrl.includes('shikimori.one')) {
        const shikimoriId = extractShikimoriId(shikimoriUrl);
        
        if (shikimoriId) {
          setIsCheckingReleaseStatus(true);
          try {
            const status = await checkTitleStatus(shikimoriId, item.type);
            setReleaseStatus(status);
          } catch (error) {
            console.error('Error checking release status:', error);
          } finally {
            setIsCheckingReleaseStatus(false);
          }
        }
      }
    };

    checkReleaseStatus();
  }, [item.apiUrl, item.url, item.type]);

  // Функция для извлечения ID из URL Shikimori
  const extractShikimoriId = (url) => {
    const match = url.match(/shikimori\.one\/(?:animes|mangas)\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Функции для отображения статуса выпуска
  const getReleaseStatusText = (status) => {
    switch(status) {
      case 'ongoing': return 'Выходит';
      case 'completed': return 'Завершено';
      case 'anons': return 'Анонс';
      case 'released': return 'Вышло';
      default: return '';
    }
  };

  // Получаем адаптивные размеры
  const cardSizes = getCardSizes(screenWidth);

  // Оптимизируем функции с помощью useCallback
  const openExternal = useCallback(() => {
    if (!item?.url) return;
    let url = item.url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [item?.url]);

  const setRating = useCallback((r) => {
    onUpdate?.(item.id, { rating: r === item.rating ? 0 : r });
  }, [onUpdate, item.id, item.rating]);

  const toggleFavorite = useCallback(() => {
    onUpdate?.(item.id, { favorite: !item.favorite });
  }, [onUpdate, item.id, item.favorite]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    onDelete?.(item.id);
    setShowDeleteConfirmation(false);
  }, [onDelete, item.id]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirmation(false);
  }, []);

  const handleStatusChange = useCallback((newStatus) => {
    onUpdate?.(item.id, { status: newStatus });
  }, [onUpdate, item.id]);

  const getStatusLabel = useCallback((status, type) => {
    switch (status) {
      case 'planned': return 'Запланировано';
      case 'watching': return type === 'manga' ? 'Читаю' : 'Смотрю';
      case 'completed': return type === 'manga' ? 'Прочитано' : 'Просмотрено';
      case 'dropped': return 'Брошено';
      default: return 'Неизвестно';
    }
  }, []);

  const inc = useCallback(() => {
    if (item.type === 'movie') return;
    const next = Math.min((item.watchedEpisodes || 0) + 1, item.totalEpisodes || Infinity);
    onUpdate?.(item.id, { watchedEpisodes: next, status: (item.totalEpisodes && next >= item.totalEpisodes) ? 'completed' : item.status });
  }, [onUpdate, item.id, item.type, item.watchedEpisodes, item.totalEpisodes, item.status]);

  const dec = useCallback(() => {
    if (item.type === 'movie') return;
    const next = Math.max((item.watchedEpisodes || 0) - 1, 0);
    onUpdate?.(item.id, { watchedEpisodes: next, status: next === 0 && item.status === 'completed' ? 'planned' : item.status });
  }, [onUpdate, item.id, item.type, item.watchedEpisodes, item.status]);

  const progress = useMemo(() => {
    if (item.type === 'movie') return 100;
    const w = item.watchedEpisodes || 0;
    const t = item.totalEpisodes || 0;
    if (!t) return 0;
    return Math.min(100, Math.round((w / t) * 100));
  }, [item.watchedEpisodes, item.totalEpisodes, item.type]);

  const showProgress = item.type !== 'movie';
  const percentColor = progress >= 100 ? '#9ca3af' : progress >= 75 ? '#22c55e' : progress >= 40 ? '#a3e635' : '#22c55e';

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      layout
    >
      <Card $flipped={showDeleteConfirmation} $sizes={cardSizes}>
        {/* Передняя сторона карточки */}
        <CardFront $sizes={cardSizes}>
          <Grid $sizes={cardSizes}>
            <Poster data-has={!!item.imageUrl} data-empty="Нет постера">
              {item.imageUrl ? <LazyImage src={item.imageUrl} alt={item.title} /> : null}
            </Poster>

            <Right>
              <MainContent>
                <Header>
                  <Title
                    $hasUrl={!!item.url}
                    $sizes={cardSizes}
                    onClick={item.url ? openExternal : undefined}
                    title={item.url ? 'Открыть ссылку' : undefined}
                  >
                    {item.title}
                    {item.url ? <ExternalLink size={14} /> : null}
                  </Title>
                  <TypeBadge>{typeLabel[item.type] || item.type}</TypeBadge>
                </Header>

                <MetaRow>
                  <Meta $sizes={cardSizes}>
                    {item.year && <span>{item.year}</span>}
                    {item.totalEpisodes
                      ? <span>{item.watchedEpisodes || 0}/{item.totalEpisodes} {item.type === 'manga' ? 'гл.' : 'эп.'}</span>
                      : item.type === 'movie' && <span>Фильм</span>}
                    {item.apiRating && (
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                        <Star size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />
                        {item.apiRating}
                      </span>
                    )}
                  </Meta>
                </MetaRow>

                <MetaRow>
                  <Meta $sizes={cardSizes}>
                    <span>{getStatusLabel(item.status, item.type)}</span>
                    {releaseStatus && (
                      <ReleaseStatusBadge $status={releaseStatus.status} data-no-bullet>
                        {getReleaseStatusText(releaseStatus.status)}
                      </ReleaseStatusBadge>
                    )}
                    {isCheckingReleaseStatus && (
                      <span style={{ 
                        fontSize: '10px', 
                        color: '#9ca3af', 
                        marginLeft: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        Проверка...
                      </span>
                    )}
                  </Meta>
                </MetaRow>

                {showProgress && (
                  <ProgressRow>
                    <Bar title={`${progress}%`}>
                      <Fill $w={progress} />
                    </Bar>
                    <Pct>{progress}%</Pct>
                    <div style={{ display:'flex', gap:8 }}>
                      <Round 
                        onClick={dec} 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Minus size={14} />
                      </Round>
                      <Round 
                        onClick={inc} 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Plus size={14} />
                      </Round>
                    </div>
                  </ProgressRow>
                )}

                <RatingRow onMouseLeave={() => setHoverRating(0)}>
                  <Stars>
                    {Array.from({ length: 10 }).map((_, i) => {
                      const n = i + 1;
                      return (
                        <StarBtn
                          key={n}
                          type="button"
                          $active={n <= (hoverRating || item.rating || 0)}
                          onMouseEnter={() => setHoverRating(n)}
                          onClick={() => setRating(n)}
                          aria-label={`Оценка ${n}`}
                          title={`Оценка ${n}`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Star size={12} />
                        </StarBtn>
                      );
                    })}
                  </Stars>
                  <RatingText $sizes={cardSizes}>{(hoverRating || item.rating) ? `${hoverRating || item.rating}/10` : 'Без оценки'}</RatingText>
                </RatingRow>

              </MainContent>

              <BottomRow>
                {(item.tags?.length > 0 || item.comment) && (
                  <GhostBtn 
                    title={item.tags?.join(', ')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <TagIcon size={14} />
                    <span style={{ marginLeft: '2px' }}>{(item.tags?.length || 0) + (item.comment ? 1 : 0)}</span>
                  </GhostBtn>
                )}
                <IconActions>
                  <StatusSelect
                    value={item.status}
                    onChange={(e) => {
                      handleStatusChange(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="planned">Запланировано</option>
                    <option value="watching">{item.type === 'manga' ? 'Читаю' : 'Смотрю'}</option>
                    <option value="completed">{item.type === 'manga' ? 'Прочитано' : 'Просмотрено'}</option>
                    <option value="dropped">Брошено</option>
                  </StatusSelect>
                  <GhostBtn 
                    onClick={() => onEdit?.(item)} 
                    title="Редактировать"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Edit3 size={14} />
                  </GhostBtn>
                  <GhostBtn
                    onClick={toggleFavorite}
                    title={item.favorite ? "Убрать из избранного" : "Добавить в избранное"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Heart size={14} fill={item.favorite ? "#ef4444" : "none"} />
                  </GhostBtn>
                  <GhostBtn
                    className="danger"
                    onClick={handleDeleteClick}
                    title="Удалить"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Trash2 size={14} />
                  </GhostBtn>
                </IconActions>
              </BottomRow>
            </Right>
          </Grid>
        </CardFront>

        {/* Обратная сторона карточки */}
        <CardBack $sizes={cardSizes}>
          <WarningContent>
            <WarningIcon>
              <AlertTriangle size={20} />
            </WarningIcon>
            
            <WarningText>
              Вы действительно хотите удалить?<br />
              Это действие нельзя отменить.
            </WarningText>
            
            <ConfirmationButtons>
              <ConfirmBtn 
                className="secondary" 
                onClick={handleDeleteCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <X size={14} />
                Отменить
              </ConfirmBtn>
              <ConfirmBtn 
                className="danger" 
                onClick={handleDeleteConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Trash2 size={14} />
                Удалить
              </ConfirmBtn>
            </ConfirmationButtons>
          </WarningContent>
        </CardBack>
      </Card>
    </CardContainer>
  );
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;
