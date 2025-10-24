import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Trash2, Edit3, Plus, Minus, Star, ExternalLink, Tag as TagIcon, MessageCircle, AlertTriangle, X, Heart } from 'lucide-react';

/** ============== Layout constants ============== */
const POSTER_W = 120; // шире постер для визуального баланса

/** ============== Card shell ============== */
const CardContainer = styled.div`
  width: 100%;
  perspective: 1000px;
`;

const Card = styled.div`
  width: 100%;
  height: 280px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
  transform: ${p => p.$flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFace = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 280px;
  backface-visibility: hidden;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 16px;
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
  grid-template-columns: ${POSTER_W}px 1fr;
  gap: 14px;
  padding: 14px;
  > * { min-width: 0; }

  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr;
    gap: 12px;
    padding: 12px;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }

  @media (max-width: 400px) {
    padding: 8px;
    gap: 8px;
  }
`;

const Poster = styled.div`
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${p => p.theme.border};
  background: linear-gradient(180deg, rgba(148,163,184,.18), rgba(148,163,184,.08));
  display: grid; place-items: center;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }

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
  height: 100%;
  min-width: 0;
  gap: 8px;
  
  @media (max-width: 560px) {
    gap: 6px;
  }

  @media (max-width: 400px) {
    gap: 4px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  font-size: 18px;
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

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 400px) {
    font-size: 14px;
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
  font-size: 12px;
  flex-wrap: wrap;
  
  span + span::before {
    content: "•";
    margin: 0 6px;
    color: ${p => p.theme.textSecondary};
    opacity: .65;
  }

  @media (max-width: 400px) {
    font-size: 11px;
    gap: 6px;
  }
`;

const StatusDot = styled.span`
  display: inline-block; width: 8px; height: 8px; border-radius: 999px; margin-right: 6px;
  background: ${p => p.$color || '#9ca3af'};
`;

const StatusSelect = styled.select`
  background: ${p => p.theme.surfaceSecondary};
  color: ${p => p.theme.text};
  border: 1px solid ${p => p.theme.border};
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 700;
  outline: none;
  transition: border-color .15s ease, background-color .15s ease;
  &:focus { border-color: ${p => p.theme.accent}; background: ${p => p.theme.surface}; }
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
const StarBtn = styled.button`
  background: none; border: none; padding: 0 1px; cursor: pointer;
  color: ${p => (p.$active ? '#f59e0b' : p.theme.textSecondary)};
  &:hover { color: #f59e0b; transform: scale(1.05); }
  transition: transform .1s ease;
  
  @media (max-width: 400px) {
    padding: 0;
  }
`;
const RatingText = styled.span`
  font-size: 12px; color: ${p => p.theme.textSecondary}; font-weight: 700;
  
  @media (max-width: 400px) {
    font-size: 11px;
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
`;
const Fill = styled.div`
  position: absolute; left: 0; top: 0; bottom: 0;
  width: ${p => p.$w || 0}%;
  background: ${p => p.$color || '#22c55e'};
  transition: width .2s ease;
`;

const Pct = styled.span`
  width: 46px; text-align: right; font-size: 12px; color: ${p => p.theme.textSecondary}; font-weight: 800;
`;

const Round = styled.button`
  width: 28px; height: 28px; display: grid; place-items: center;
  border-radius: 999px; border: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.surfaceSecondary};
  color: ${p => p.theme.text};
  cursor: pointer;
  &:hover { background: ${p => p.theme.surface}; }
`;

/** ============== Bottom actions / tags ============== */
const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 10px;
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
    row-gap: 8px;
    column-gap: 0;
  }
`;

const Tags = styled.div`
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0;
  
  @media (max-width: 400px) {
    gap: 6px;
  }
`;

const TagChip = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 8px; border-radius: 999px; font-size: 12px; font-weight: 700;
  background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.border}; color: ${p => p.theme.text};
  
  @media (max-width: 400px) {
    font-size: 11px;
    padding: 2px 6px;
    gap: 4px;
  }
`;

const IconActions = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;
  
  @media (max-width: 400px) {
    gap: 6px;
    justify-content: center;
  }
`;

const GhostBtn = styled.button`
  border: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.background};
  color: ${p => p.theme.text};
  padding: 8px; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  &.danger { color: #ef4444; border-color: #ef4444; }
  &:hover { 
    background: ${p => p.theme.surface}; 
  }
  font-size: 12px; white-space: nowrap;
  width: 32px; height: 32px;
  
  @media (max-width: 400px) {
    width: 28px; height: 28px;
    padding: 6px;
  }
`;

/** ============== Delete Confirmation ============== */
const WarningContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 24px;
  text-align: center;
`;

const WarningIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
`;

const WarningText = styled.p`
  font-size: 16px;
  color: ${p => p.theme.textSecondary};
  margin: 0 0 32px 0;
  line-height: 1.5;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 100%;
`;

const ConfirmBtn = styled.button`
  flex: 1;
  max-width: 120px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;

  &.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
    }
  }

  &.secondary {
    background: ${p => p.theme.surface};
    color: ${p => p.theme.text};
    border: 1px solid ${p => p.theme.border};

    &:hover {
      background: ${p => p.theme.background};
      transform: translateY(-1px);
      box-shadow: 0 6px 16px ${p => p.theme.shadow};
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

/** ============== Component ============== */
export default function MediaCard({ item, onUpdate, onDelete, onEdit, isDarkTheme }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const openExternal = () => {
    if (!item?.url) return;
    let url = item.url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const setRating = r => onUpdate?.(item.id, { rating: r === item.rating ? 0 : r });

  const toggleFavorite = () => {
    onUpdate?.(item.id, { favorite: !item.favorite });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(item.id);
    setShowDeleteConfirmation(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  const inc = () => {
    if (item.type === 'movie') return;
    const next = Math.min((item.watchedEpisodes || 0) + 1, item.totalEpisodes || Infinity);
    onUpdate?.(item.id, { watchedEpisodes: next, status: (item.totalEpisodes && next >= item.totalEpisodes) ? 'completed' : item.status });
  };
  const dec = () => {
    if (item.type === 'movie') return;
    const next = Math.max((item.watchedEpisodes || 0) - 1, 0);
    onUpdate?.(item.id, { watchedEpisodes: next, status: next === 0 && item.status === 'completed' ? 'planned' : item.status });
  };

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
    <CardContainer>
      <Card $flipped={showDeleteConfirmation}>
        {/* Передняя сторона карточки */}
        <CardFront>
          <Grid>
            <Poster data-has={!!item.imageUrl} data-empty="Нет постера">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : null}
            </Poster>

            <Right>
              <MainContent>
                <Header>
                  <Title
                    $hasUrl={!!item.url}
                    onClick={item.url ? openExternal : undefined}
                    title={item.url ? 'Открыть ссылку' : undefined}
                  >
                    {item.title}
                    {item.url ? <ExternalLink size={16} /> : null}
                  </Title>
                  <TypeBadge>{typeLabel[item.type] || item.type}</TypeBadge>
                </Header>

                <MetaRow>
                  <Meta>
                    {item.year && <span>{item.year}</span>}
                    {item.totalEpisodes
                      ? <span>{item.watchedEpisodes || 0}/{item.totalEpisodes} {item.type === 'manga' ? 'гл.' : 'эп.'}</span>
                      : item.type === 'movie' && <span>Фильм</span>}
                    <span><StatusDot $color={statusColor(item.status)} />{getStatusLabel(item.status, item.type)}</span>
                  </Meta>
                  <StatusSelect value={item.status} onChange={(e)=>onUpdate?.(item.id,{status:e.target.value})}>
                    <option value="planned">Запланировано</option>
                    <option value="watching">{item.type === 'manga' ? 'Читаю' : 'Смотрю'}</option>
                    <option value="completed">{item.type === 'manga' ? 'Прочитано' : 'Просмотрено'}</option>
                    <option value="dropped">Брошено</option>
                  </StatusSelect>
                </MetaRow>

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
                        >
                          <Star size={14} />
                        </StarBtn>
                      );
                    })}
                  </Stars>
                  <RatingText>{(hoverRating || item.rating) ? `${hoverRating || item.rating}/10` : 'Без оценки'}</RatingText>
                </RatingRow>

                {showProgress && (
                  <ProgressRow>
                    <Bar title={`${progress}%`}>
                      <Fill $w={progress} $color={percentColor} />
                    </Bar>
                    <Pct>{progress}%</Pct>
                    <div style={{ display:'flex', gap:8 }}>
                      <Round onClick={dec} title="−1"><Minus size={16} /></Round>
                      <Round onClick={inc} title="+1"><Plus size={16} /></Round>
                    </div>
                  </ProgressRow>
                )}
              </MainContent>

              <BottomRow>
                {item.tags?.length > 0 || item.comment ? (
                  <Tags>
                    {item.tags?.slice(0, 3).map((t, i) => (
                      <TagChip key={i}><TagIcon size={12} /> {t}</TagChip>
                    ))}
                    {item.tags && item.tags.length > 3 && <TagChip>+{item.tags.length - 3}</TagChip>}
                    {item.comment && (
                      <TagChip title={item.comment}>
                        <MessageCircle size={12} /> заметка
                      </TagChip>
                    )}
                  </Tags>
                ) : <div />}

                <IconActions>
                  <GhostBtn onClick={() => onEdit?.(item)} title="Редактировать">
                    <Edit3 size={16} />
                  </GhostBtn>
                  <GhostBtn
                    onClick={toggleFavorite}
                    title={item.favorite ? "Убрать из избранного" : "Добавить в избранное"}
                  >
                    <Heart size={16} fill={item.favorite ? "#ef4444" : "none"} />
                  </GhostBtn>
                  <GhostBtn
                    className="danger"
                    onClick={handleDeleteClick}
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </GhostBtn>
                </IconActions>
              </BottomRow>
            </Right>
          </Grid>
        </CardFront>

        {/* Обратная сторона карточки */}
        <CardBack>
          <WarningContent>
            <WarningIcon>
              <AlertTriangle size={24} />
            </WarningIcon>
            
            <WarningText>
              Вы действительно хотите удалить?<br />
              Это действие нельзя отменить.
            </WarningText>
            
            <ConfirmationButtons>
              <ConfirmBtn className="secondary" onClick={handleDeleteCancel}>
                <X size={16} />
                Отменить
              </ConfirmBtn>
              <ConfirmBtn className="danger" onClick={handleDeleteConfirm}>
                <Trash2 size={16} />
                Удалить
              </ConfirmBtn>
            </ConfirmationButtons>
          </WarningContent>
        </CardBack>
      </Card>
    </CardContainer>
  );
}
