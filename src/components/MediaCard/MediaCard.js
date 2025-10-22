import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Trash2, Edit3, Plus, Minus, Star, ExternalLink, Tag as TagIcon, MessageCircle } from 'lucide-react';

/** ============== Layout constants ============== */
const POSTER_W = 120; // шире постер для визуального баланса

/** ============== Card shell ============== */
const Card = styled.div`
  width: 100%;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 16px;
  box-shadow: 0 6px 16px ${p => p.theme.shadow};
  overflow: hidden;
  transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${p => p.theme.accent};
    box-shadow: 0 10px 24px ${p => p.theme.shadow};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${POSTER_W}px 1fr;
  gap: 14px;
  padding: 14px;
  > * { min-width: 0; }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
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
  display: grid;
  grid-template-rows: auto auto auto auto auto;
  row-gap: 10px;
`;

const Header = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
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

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover { color: ${p => (p.$hasUrl ? p.theme.accent : p.theme.text)}; }
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
`;

const Meta = styled.div`
  display: flex; align-items: center; gap: 8px;
  color: ${p => p.theme.textSecondary};
  font-size: 12px;
  span + span::before {
    content: "•";
    margin: 0 6px;
    color: ${p => p.theme.textSecondary};
    opacity: .65;
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
`;
const Stars = styled.div` display: flex; gap: 2px; `;
const StarBtn = styled.button`
  background: none; border: none; padding: 0 1px; cursor: pointer;
  color: ${p => (p.$active ? '#f59e0b' : p.theme.textSecondary)};
  &:hover { color: #f59e0b; transform: scale(1.05); }
  transition: transform .1s ease;
`;
const RatingText = styled.span`
  font-size: 12px; color: ${p => p.theme.textSecondary}; font-weight: 700;
`;

/** ============== Progress ============== */
const ProgressRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
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
`;

const Tags = styled.div`
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0;
`;

const TagChip = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 8px; border-radius: 999px; font-size: 12px; font-weight: 700;
  background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.border}; color: ${p => p.theme.text};
`;

const IconActions = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;
`;

const GhostBtn = styled.button`
  border: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.background};
  color: ${p => p.theme.text};
  padding: 8px; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  &.danger { color: #ef4444; border-color: #ef4444; }
  &:hover { background: ${p => p.theme.surface}; }
  font-size: 12px; white-space: nowrap;
  width: 32px; height: 32px;
`;

/** ============== Helpers ============== */
const statusLabel = { planned: 'Запланировано', watching: 'Смотрю', completed: 'Просмотрено', dropped: 'Брошено' };
const typeLabel   = { anime: 'Аниме', movie: 'Фильм',  series: 'Сериал' };
const statusColor = (s) => ({ watching:'#22c55e', planned:'#3b82f6', dropped:'#ef4444', completed:'#9ca3af' }[s] || '#9ca3af');

/** ============== Component ============== */
export default function MediaCard({ item, onUpdate, onDelete, onEdit, isDarkTheme }) {
  const [hoverRating, setHoverRating] = useState(0);

  const openExternal = () => {
    if (!item?.url) return;
    let url = item.url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const setRating = r => onUpdate?.(item.id, { rating: r === item.rating ? 0 : r });

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
    <Card>
      <Grid>
        <Poster data-has={!!item.imageUrl} data-empty="Нет постера">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : null}
        </Poster>

        <Right>
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
                ? <span>{item.watchedEpisodes || 0}/{item.totalEpisodes} эп.</span>
                : item.type === 'movie' && <span>Фильм</span>}
              <span><StatusDot $color={statusColor(item.status)} />{statusLabel[item.status]}</span>
            </Meta>
            <StatusSelect value={item.status} onChange={(e)=>onUpdate?.(item.id,{status:e.target.value})}>
              <option value="planned">Запланировано</option>
              <option value="watching">Смотрю</option>
              <option value="completed">Просмотрено</option>
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
                className="danger"
                onClick={() => window.confirm('Удалить элемент?') && onDelete?.(item.id)}
                title="Удалить"
              >
                <Trash2 size={16} />
              </GhostBtn>
            </IconActions>
          </BottomRow>
        </Right>
      </Grid>
    </Card>
  );
}
