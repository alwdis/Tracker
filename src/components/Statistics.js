import React, { useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Star, Play, Check, Clock, X, TrendingUp, Calendar, Eye, BookOpen, Film, Tv, Zap, Award, Target, Tag } from 'lucide-react';
import { getTheme } from '../themes';

const StatisticsContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const StatCard = styled(motion.div)`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
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
    transform: translateY(-4px);
    box-shadow: 0 8px 25px ${props => props.theme.shadow};
    
    &::before {
      opacity: 1;
    }
  }
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradientShift 4s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  font-weight: 600;
`;

const ChartsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const ChartCard = styled(motion.div)`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 24px;
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
      rgba(102, 126, 234, 0.03) 0%, 
      rgba(118, 75, 162, 0.03) 50%, 
      rgba(240, 147, 251, 0.03) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    &::before {
      opacity: 1;
    }
  }
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContent = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textSecondary};
`;

const TopRatedSection = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 24px;
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
      rgba(102, 126, 234, 0.02) 0%, 
      rgba(118, 75, 162, 0.02) 50%, 
      rgba(240, 147, 251, 0.02) 100%);
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const TopRatedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TopRatedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.theme.surfaceSecondary};
  border-radius: 12px;
  transition: all 0.2s ease;
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
    transition: opacity 0.2s ease;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    background: ${props => props.theme.surface};
    transform: translateX(4px);
    
    &::before {
      opacity: 1;
    }
  }
`;

const TopRatedRank = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const TopRatedTitle = styled.div`
  flex: 1;
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const TopRatedRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.rating};
  font-weight: 600;
`;

// Новые компоненты для улучшенной визуализации
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.surfaceSecondary};
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 4px;
  transition: width 0.8s ease;
  width: ${props => props.percentage}%;
`;

const CircularProgress = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
`;

const CircularProgressSvg = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

const CircularProgressCircle = styled.circle`
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.8s ease;
`;

const CircularProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ChartBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
`;

const ChartBarLabel = styled.div`
  min-width: 80px;
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
`;

const ChartBarFill = styled.div`
  flex: 1;
  height: 20px;
  background: ${props => props.theme.surfaceSecondary};
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

const ChartBarProgress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.color || '#667eea'} 0%, ${props => props.color || '#764ba2'} 100%);
  border-radius: 10px;
  transition: width 0.8s ease;
  width: ${props => props.percentage}%;
`;

const ChartBarValue = styled.div`
  min-width: 30px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const InsightCard = styled(motion.div)`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 20px;
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
      rgba(102, 126, 234, 0.02) 0%, 
      rgba(118, 75, 162, 0.02) 50%, 
      rgba(240, 147, 251, 0.02) 100%);
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const InsightIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white;
`;

const InsightTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 8px;
`;

const InsightValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
`;

const InsightDescription = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  line-height: 1.4;
`;


const TimeRangeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 16px;
  }
`;

const TimeRangeButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.active ? props.theme.accent : props.theme.surface};
  color: ${props => props.active ? 'white' : props.theme.text};
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.accent};
    color: white;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 11px;
  }
`;

const StatsInsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin: 16px 0;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
    margin: 12px 0;
  }
`;

const FinalStatsContainer = styled.div`
  text-align: center;
  margin-top: 40px;
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    margin-top: 32px;
    font-size: 13px;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    margin-top: 24px;
    font-size: 12px;
    gap: 8px;
  }
`;

const Statistics = React.memo(({ media, currentTheme }) => {
  const [timeRange, setTimeRange] = useState('all');

  // Функция для расчета статистики с учетом временного диапазона
  const calculateStatsData = useCallback((mediaData, range) => {
    let filteredMedia = mediaData;
    
    if (range !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (range) {
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        default:
          cutoffDate.setDate(now.getDate() - 30);
      }
      
      filteredMedia = mediaData.filter(item => {
        // Предполагаем, что у элементов есть дата добавления или изменения
        const itemDate = item.dateAdded ? new Date(item.dateAdded) : new Date(item.dateModified || item.createdAt || 0);
        return itemDate >= cutoffDate;
      });
    }

    const totalItems = filteredMedia.length;
    
    const ratedItems = filteredMedia.filter(item => item.rating > 0);
    const averageRating = ratedItems.length > 0 
      ? ratedItems.reduce((sum, item) => sum + item.rating, 0) / ratedItems.length 
      : 0;

    const totalEpisodes = filteredMedia
      .filter(item => item.totalEpisodes)
      .reduce((sum, item) => sum + item.totalEpisodes, 0);
    
    const watchedEpisodes = filteredMedia
      .filter(item => item.watchedEpisodes)
      .reduce((sum, item) => sum + item.watchedEpisodes, 0);

    const statusCounts = {
      planned: filteredMedia.filter(item => item.status === 'planned').length,
      watching: filteredMedia.filter(item => item.status === 'watching').length,
      completed: filteredMedia.filter(item => item.status === 'completed').length,
      dropped: filteredMedia.filter(item => item.status === 'dropped').length
    };

    const typeCounts = {
      anime: filteredMedia.filter(item => item.type === 'anime').length,
      movie: filteredMedia.filter(item => item.type === 'movie').length,
      series: filteredMedia.filter(item => item.type === 'series').length,
      manga: filteredMedia.filter(item => item.type === 'manga').length
    };

    const ratingDistribution = Array.from({ length: 10 }, (_, i) => ({
      rating: i + 1,
      count: filteredMedia.filter(item => item.rating === i + 1).length
    }));

    const topRated = filteredMedia
      .filter(item => item.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    const completionRate = totalItems > 0 
      ? Math.round((statusCounts.completed / totalItems) * 100) 
      : 0;

    // Новые метрики
    const avgEpisodesPerTitle = totalItems > 0 ? Math.round(totalEpisodes / totalItems) : 0;
    const completionEfficiency = totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;
    
    // Анализ тегов
    const tagCounts = {};
    filteredMedia.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Анализ рейтингов
    const ratingInsights = {
      highRated: filteredMedia.filter(item => item.rating >= 8).length,
      mediumRated: filteredMedia.filter(item => item.rating >= 5 && item.rating < 8).length,
      lowRated: filteredMedia.filter(item => item.rating > 0 && item.rating < 5).length,
      unrated: filteredMedia.filter(item => item.rating === 0).length
    };

    return {
      totalItems,
      averageRating,
      totalEpisodes,
      watchedEpisodes,
      statusCounts,
      typeCounts,
      ratingDistribution,
      topRated,
      completionRate,
      avgEpisodesPerTitle,
      completionEfficiency,
      topTags,
      ratingInsights
    };
  }, []);

  // Мемоизируем все тяжелые вычисления
  const statsData = useMemo(() => {
    return calculateStatsData(media, timeRange);
  }, [media, timeRange, calculateStatsData]);

  // Деструктурируем для удобства
  const {
    totalItems,
    averageRating,
    totalEpisodes,
    watchedEpisodes,
    statusCounts,
    typeCounts,
    ratingDistribution,
    topRated,
    completionRate,
    avgEpisodesPerTitle,
    completionEfficiency,
    topTags,
    ratingInsights
  } = statsData;

  // Цвета для различных типов контента
  const typeColors = {
    anime: '#ff6b6b',
    movie: '#4ecdc4',
    series: '#45b7d1',
    manga: '#96ceb4'
  };

  // Цвета для статусов
  const statusColors = {
    planned: '#f39c12',
    watching: '#3498db',
    completed: '#2ecc71',
    dropped: '#e74c3c'
  };

  return (
    <StatisticsContainer>
      <Header>
        <Title>
          <BarChart3 size={32} />
          Статистика вашей коллекции
        </Title>
        
        <TimeRangeSelector>
          <TimeRangeButton 
            active={timeRange === 'all'} 
            onClick={() => setTimeRange('all')}
            theme={getTheme(currentTheme)}
          >
            Все время
          </TimeRangeButton>
          <TimeRangeButton 
            active={timeRange === 'year'} 
            onClick={() => setTimeRange('year')}
            theme={getTheme(currentTheme)}
          >
            Год
          </TimeRangeButton>
          <TimeRangeButton 
            active={timeRange === 'month'} 
            onClick={() => setTimeRange('month')}
            theme={getTheme(currentTheme)}
          >
            Месяц
          </TimeRangeButton>
          <TimeRangeButton 
            active={timeRange === 'week'} 
            onClick={() => setTimeRange('week')}
            theme={getTheme(currentTheme)}
          >
            Неделя
          </TimeRangeButton>
        </TimeRangeSelector>
      </Header>

      <StatsGrid
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatNumber>{totalItems}</StatNumber>
          <StatLabel>Всего тайтлов</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatNumber>{averageRating > 0 ? averageRating.toFixed(1) : '—'}</StatNumber>
          <StatLabel>Средний рейтинг</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatNumber>{totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0}%</StatNumber>
          <StatLabel>Прогресс просмотра/чтения</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatNumber>{statusCounts.completed}</StatNumber>
          <StatLabel>Завершено</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Новые инсайты */}
      <StatsInsightsGrid>
        <InsightCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <InsightIcon>
            <TrendingUp size={20} />
          </InsightIcon>
          <InsightTitle>Эффективность просмотра</InsightTitle>
          <InsightValue>{completionEfficiency}%</InsightValue>
          <InsightDescription>
            Процент просмотренных серий от общего количества
          </InsightDescription>
        </InsightCard>

        <InsightCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
        >
          <InsightIcon>
            <Clock size={20} />
          </InsightIcon>
          <InsightTitle>Средняя длина тайтла</InsightTitle>
          <InsightValue>{avgEpisodesPerTitle}</InsightValue>
          <InsightDescription>
            Серий/глав в среднем на тайтл
          </InsightDescription>
        </InsightCard>

        <InsightCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
        >
          <InsightIcon>
            <Award size={20} />
          </InsightIcon>
          <InsightTitle>Высокооцененные</InsightTitle>
          <InsightValue>{ratingInsights.highRated}</InsightValue>
          <InsightDescription>
            Тайтлы с рейтингом 8+ из 10
          </InsightDescription>
        </InsightCard>

        <InsightCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
        >
          <InsightIcon>
            <Target size={20} />
          </InsightIcon>
          <InsightTitle>Без оценки</InsightTitle>
          <InsightValue>{ratingInsights.unrated}</InsightValue>
          <InsightDescription>
            Тайтлы, которые еще не оценены
          </InsightDescription>
        </InsightCard>
      </StatsInsightsGrid>

      <ChartsGrid
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <ChartCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
        >
          <ChartTitle>
            <Play size={18} />
            Распределение по типам
          </ChartTitle>
          <ChartContent>
            <div style={{ width: '100%' }}>
              <ChartBar>
                <ChartBarLabel>Аниме</ChartBarLabel>
                <ChartBarFill>
                  <ChartBarProgress 
                    percentage={totalItems > 0 ? (typeCounts.anime / totalItems) * 100 : 0}
                    color={typeColors.anime}
                  />
                </ChartBarFill>
                <ChartBarValue>{typeCounts.anime}</ChartBarValue>
              </ChartBar>
              <ChartBar>
                <ChartBarLabel>Фильмы</ChartBarLabel>
                <ChartBarFill>
                  <ChartBarProgress 
                    percentage={totalItems > 0 ? (typeCounts.movie / totalItems) * 100 : 0}
                    color={typeColors.movie}
                  />
                </ChartBarFill>
                <ChartBarValue>{typeCounts.movie}</ChartBarValue>
              </ChartBar>
              <ChartBar>
                <ChartBarLabel>Сериалы</ChartBarLabel>
                <ChartBarFill>
                  <ChartBarProgress 
                    percentage={totalItems > 0 ? (typeCounts.series / totalItems) * 100 : 0}
                    color={typeColors.series}
                  />
                </ChartBarFill>
                <ChartBarValue>{typeCounts.series}</ChartBarValue>
              </ChartBar>
              <ChartBar>
                <ChartBarLabel>Манга</ChartBarLabel>
                <ChartBarFill>
                  <ChartBarProgress 
                    percentage={totalItems > 0 ? (typeCounts.manga / totalItems) * 100 : 0}
                    color={typeColors.manga}
                  />
                </ChartBarFill>
                <ChartBarValue>{typeCounts.manga}</ChartBarValue>
              </ChartBar>
            </div>
          </ChartContent>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
        >
          <ChartTitle>
            <Check size={18} />
            Статусы просмотра/чтения
          </ChartTitle>
          <ChartContent>
            <div style={{ width: '100%' }}>
              <ChartBar>
                <ChartBarLabel>Смотрю</ChartBarLabel>
                <ChartBarFill>
                  <ChartBarProgress 
                    percentage={totalItems > 0 ? (statusCounts.watching / totalItems) * 100 : 0}
                    color={statusColors.watching}
                  />
                </ChartBarFill>
                <ChartBarValue>{statusCounts.watching}</ChartBarValue>
              </ChartBar>
              <ChartBar>
                <ChartBarLabel>Запланировано</ChartBarLabel>
                <ChartBarFill>
                  <ChartBarProgress 
                    percentage={totalItems > 0 ? (statusCounts.planned / totalItems) * 100 : 0}
                    color={statusColors.planned}
                  />
                </ChartBarFill>
                <ChartBarValue>{statusCounts.planned}</ChartBarValue>
              </ChartBar>
              <ChartBar>
                <ChartBarLabel>Завершено</ChartBarLabel>
                <ChartBarFill>
                  <ChartBarProgress 
                    percentage={totalItems > 0 ? (statusCounts.completed / totalItems) * 100 : 0}
                    color={statusColors.completed}
                  />
                </ChartBarFill>
                <ChartBarValue>{statusCounts.completed}</ChartBarValue>
              </ChartBar>
              <ChartBar>
                <ChartBarLabel>Брошено</ChartBarLabel>
                <ChartBarFill>
                  <ChartBarProgress 
                    percentage={totalItems > 0 ? (statusCounts.dropped / totalItems) * 100 : 0}
                    color={statusColors.dropped}
                  />
                </ChartBarFill>
                <ChartBarValue>{statusCounts.dropped}</ChartBarValue>
              </ChartBar>
            </div>
          </ChartContent>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
        >
          <ChartTitle>
            <Star size={18} />
            Распределение оценок
          </ChartTitle>
          <ChartContent>
            <div style={{ width: '100%' }}>
              {ratingDistribution.filter(item => item.count > 0).map(({ rating, count }) => (
                <ChartBar key={rating}>
                  <ChartBarLabel>{rating}★</ChartBarLabel>
                  <ChartBarFill>
                    <ChartBarProgress 
                      percentage={totalItems > 0 ? (count / totalItems) * 100 : 0}
                      color={`hsl(${(rating - 1) * 36}, 70%, 50%)`}
                    />
                  </ChartBarFill>
                  <ChartBarValue>{count}</ChartBarValue>
                </ChartBar>
              ))}
            </div>
          </ChartContent>
        </ChartCard>
      </ChartsGrid>

      <TopRatedSection>
        <ChartTitle>
          <Star size={18} />
          Самые высокие оценки
        </ChartTitle>
        {topRated.length > 0 ? (
          <TopRatedList>
            {topRated.map((item, index) => (
              <TopRatedItem key={item.id}>
                <TopRatedRank>{index + 1}</TopRatedRank>
                <TopRatedTitle>{item.title}</TopRatedTitle>
                <TopRatedRating>
                  <Star size={14} fill="currentColor" />
                  {item.rating}/10
                </TopRatedRating>
              </TopRatedItem>
            ))}
          </TopRatedList>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: getTheme(currentTheme).textTertiary,
            padding: '40px 20px'
          }}>
            Нет оцененных тайтлов
          </div>
        )}
      </TopRatedSection>

      {/* Секция с популярными тегами */}
      {topTags.length > 0 && (
        <TopRatedSection style={{ marginTop: '24px' }}>
          <ChartTitle>
            <Tag size={18} />
            Популярные теги
          </ChartTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {topTags.map(({ tag, count }, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                style={{
                  background: `linear-gradient(135deg, ${typeColors.anime}20, ${typeColors.movie}20)`,
                  border: `1px solid ${typeColors.anime}40`,
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: getTheme(currentTheme).text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>#{tag}</span>
                <span style={{ 
                  background: typeColors.anime, 
                  color: 'white', 
                  borderRadius: '10px', 
                  padding: '2px 6px', 
                  fontSize: '10px' 
                }}>
                  {count}
                </span>
              </motion.div>
            ))}
          </div>
        </TopRatedSection>
      )}

      <FinalStatsContainer theme={getTheme(currentTheme)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Check size={16} color={statusColors.completed} />
          <strong>{completionRate}%</strong> завершено
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Play size={16} color={statusColors.watching} />
          <strong>{watchedEpisodes}</strong> серий просмотрено
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={16} color={typeColors.anime} />
          <strong>{ratingInsights.unrated}</strong> без оценки
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={16} color={typeColors.movie} />
          <strong>{completionEfficiency}%</strong> эффективность
        </div>
      </FinalStatsContainer>
    </StatisticsContainer>
  );
});

Statistics.displayName = 'Statistics';

export default Statistics;