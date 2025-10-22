import React from 'react';
import styled from 'styled-components';
import { BarChart3, Star, Play, Check, Clock, X } from 'lucide-react';

const StatisticsContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px ${props => props.theme.shadow};
  }
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.theme.accent};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  font-weight: 600;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const ChartCard = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 24px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.text};
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

  &:hover {
    background: ${props => props.theme.surface};
    transform: translateX(4px);
  }
`;

const TopRatedRank = styled.div`
  width: 24px;
  height: 24px;
  background: ${props => props.theme.accent};
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
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

function Statistics({ media, isDarkTheme }) {
  // Рассчитываем статистику
  const totalItems = media.length;
  
  const ratedItems = media.filter(item => item.rating > 0);
  const averageRating = ratedItems.length > 0 
    ? ratedItems.reduce((sum, item) => sum + item.rating, 0) / ratedItems.length 
    : 0;

  const totalEpisodes = media
    .filter(item => item.totalEpisodes)
    .reduce((sum, item) => sum + item.totalEpisodes, 0);
  
  const watchedEpisodes = media
    .filter(item => item.watchedEpisodes)
    .reduce((sum, item) => sum + item.watchedEpisodes, 0);

  const statusCounts = {
    planned: media.filter(item => item.status === 'planned').length,
    watching: media.filter(item => item.status === 'watching').length,
    completed: media.filter(item => item.status === 'completed').length,
    dropped: media.filter(item => item.status === 'dropped').length
  };

  const typeCounts = {
    anime: media.filter(item => item.type === 'anime').length,
    movie: media.filter(item => item.type === 'movie').length,
    series: media.filter(item => item.type === 'series').length
  };

  const ratingDistribution = Array.from({ length: 10 }, (_, i) => ({
    rating: i + 1,
    count: media.filter(item => item.rating === i + 1).length
  }));

  const topRated = media
    .filter(item => item.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const completionRate = totalItems > 0 
    ? Math.round((statusCounts.completed / totalItems) * 100) 
    : 0;

  return (
    <StatisticsContainer>
      <Header>
        <Title>
          <BarChart3 size={32} />
          Статистика вашей коллекции
        </Title>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{totalItems}</StatNumber>
          <StatLabel>Всего тайтлов</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{averageRating > 0 ? averageRating.toFixed(1) : '—'}</StatNumber>
          <StatLabel>Средний рейтинг</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0}%</StatNumber>
          <StatLabel>Прогресс просмотра</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{statusCounts.completed}</StatNumber>
          <StatLabel>Завершено</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <Play size={18} />
            Распределение по типам
          </ChartTitle>
          <ChartContent>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#64748b', marginBottom: '8px' }}>
                Аниме: {typeCounts.anime}
              </div>
              <div style={{ fontSize: '14px', color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#64748b', marginBottom: '8px' }}>
                Фильмы: {typeCounts.movie}
              </div>
              <div style={{ fontSize: '14px', color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#64748b' }}>
                Сериалы: {typeCounts.series}
              </div>
            </div>
          </ChartContent>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <Check size={18} />
            Статусы просмотра
          </ChartTitle>
          <ChartContent>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#64748b', marginBottom: '8px' }}>
                Смотрю: {statusCounts.watching}
              </div>
              <div style={{ fontSize: '14px', color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#64748b', marginBottom: '8px' }}>
                Запланировано: {statusCounts.planned}
              </div>
              <div style={{ fontSize: '14px', color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#64748b', marginBottom: '8px' }}>
                Просмотрено: {statusCounts.completed}
              </div>
              <div style={{ fontSize: '14px', color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#64748b' }}>
                Брошено: {statusCounts.dropped}
              </div>
            </div>
          </ChartContent>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <Star size={18} />
            Распределение оценок
          </ChartTitle>
          <ChartContent>
            <div style={{ textAlign: 'center' }}>
              {ratingDistribution.map(({ rating, count }) => (
                <div 
                  key={rating} 
                  style={{ 
                    fontSize: '12px', 
                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#64748b',
                    marginBottom: '4px'
                  }}
                >
                  {rating} звезд: {count}
                </div>
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
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : '#94a3b8',
            padding: '40px 20px'
          }}>
            Нет оцененных тайтлов
          </div>
        )}
      </TopRatedSection>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : '#64748b',
        fontSize: '14px'
      }}>
        <strong>{completionRate}%</strong> коллекции завершено • 
        <strong> {watchedEpisodes}</strong> серий просмотрено • 
        <strong> {media.filter(item => !item.rating).length}</strong> без оценки
      </div>
    </StatisticsContainer>
  );
}

export default Statistics;