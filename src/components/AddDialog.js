import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Tag, X as XIcon, Image as ImageIcon, ExternalLink, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { searchRU, getSeriesDetailsRU, getMangaDetailsRU } from '../lib/ruSources';
import { getTheme } from '../themes';

// === анимации ===
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// === темы удалены, теперь используем новую систему тем ===

// === улучшенные стили ===
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled(motion.div)`
  background: ${props => props.theme.background};
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
`;


const Form = styled.form`
  display: flex; flex-direction: column; gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const Row = styled.div`
  display: flex; gap: 16px; align-items: flex-end;
  
  @media (max-width: 480px) {
    flex-direction: column; gap: 12px;
  }
`;

const Grow = styled.div`flex: 1;`;

const Label = styled.label`
  font-size: 14px; font-weight: 600; color: ${p=>p.theme.text}; 
  margin-bottom: 8px; display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.theme.surface} 0%, ${props => props.theme.surfaceSecondary} 100%);
  color: ${props => props.theme.text};
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);

  &:focus {
    outline: none;
    border-color: ${props => props.theme.accent};
    background: ${props => props.theme.surface};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), inset 0 1px 3px rgba(0,0,0,0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.theme.surface} 0%, ${props => props.theme.surfaceSecondary} 100%);
  color: ${props => props.theme.text};
  font-size: 14px;
  transition: all 0.2s ease;
  appearance: none;
  cursor: pointer;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);

  &:focus {
    outline: none;
    border-color: ${props => props.theme.accent};
    background: ${props => props.theme.surface};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), inset 0 1px 3px rgba(0,0,0,0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
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

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      
      &::before {
        opacity: 1;
      }
    }
  }

  &.secondary {
    background: linear-gradient(135deg, ${props => props.theme.surface} 0%, ${props => props.theme.surfaceSecondary} 100%);
    color: ${props => props.theme.text};
    border: 1px solid ${props => props.theme.border};
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${props => props.theme.background} 0%, ${props => props.theme.surface} 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px ${props => props.theme.shadow};
      
      &::before {
        opacity: 1;
      }
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Helper = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  
  &.error { color: ${props => props.theme.error}; }
  &.success { color: ${props => props.theme.success}; }
  &.warning { color: ${props => props.theme.warning}; }
`;

const LoadingSpinner = styled(Loader2)`
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Results = styled.div`
  margin-top: 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.surface};
`;

const ResultItem = styled(motion.button)`
  display: flex;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px;
  cursor: pointer;
  border: 0;
  background: transparent;
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
    background: ${props => props.theme.background};
    
    &::before {
      opacity: 1;
    }
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.border};
  }
`;

const Poster = styled.div`
  width: 42px;
  height: 63px;
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.theme.surface};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const RText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const RTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.text};
`;

const RMeta = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
`;

const Thumb = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  
  img {
    width: 42px;
    height: 63px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid ${props => props.theme.border};
  }
  
  a {
    color: ${props => props.theme.accent};
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
  }
`;

const predefinedTags = [
  'комедия','драма','фэнтези','научная фантастика','романтика',
  'приключения','мистика','ужасы','детектив','боевик',
  'повседневность','школа','махо-седзе','меха','спокон',
  'сэйнэн','сёдзё','сёнэн','детский','исекай'
];

function AddDialog({ item, onClose, onSave, currentTheme }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'anime',
    status: 'planned',
    totalEpisodes: '',
    watchedEpisodes: 0,
    url: '',
    imageUrl: '',
    year: '',
    rating: 0,
    comment: '',
    tags: []
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // авто-поиск
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [errorRU, setErrorRU] = useState('');
  const [isResultSelected, setIsResultSelected] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        type: item.type,
        status: item.status,
        totalEpisodes: item.totalEpisodes || '',
        watchedEpisodes: item.watchedEpisodes || 0,
        url: item.url || '',
        imageUrl: item.imageUrl || '',
        year: item.year || '',
        rating: item.rating || 0,
        comment: item.comment || '',
        tags: item.tags || []
      });
    }
  }, [item]);

  // === автопоиск с дебаунсом ===
  useEffect(() => {
    const q = (formData.title || '').trim();
    if (q.length < 2 || isResultSelected) {
      setResults([]);
      setErrorRU('');
      return;
    }
    let isCancelled = false;
    const t = setTimeout(async () => {
      setIsSearching(true);
      setErrorRU('');
      try {
        const list = await searchRU(formData.type, q);
        if (!isCancelled) setResults((list || []).slice(0, 8));
      } catch (e) {
        if (!isCancelled) setErrorRU(String(e.message || e));
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 400);

    return () => { isCancelled = true; clearTimeout(t); };
  }, [formData.title, formData.type, isResultSelected]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('Пожалуйста, введите название');

    if (formData.type !== 'movie' && !formData.totalEpisodes) {
      return alert('Пожалуйста, укажите количество серий/глав');
    }

    const itemData = {
      ...formData,
      title: formData.title.trim(),
      totalEpisodes: formData.type !== 'movie' ? parseInt(formData.totalEpisodes) : undefined,
      watchedEpisodes: formData.type !== 'movie' ? parseInt(formData.watchedEpisodes) : 0,
      url: formData.url.trim() || undefined,
      imageUrl: formData.imageUrl || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      rating: formData.rating || 0,
      comment: formData.comment.trim() || '',
      tags: formData.tags || []
    };

    if (item) itemData.id = item.id;
    onSave(itemData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    // Сбрасываем флаг выбора результата при ручном редактировании названия
    if (field === 'title' && isResultSelected) {
      setIsResultSelected(false);
    }
  };

  const handleAddTag = (tag) => {
    const t = tag.trim().toLowerCase();
    if (t && !formData.tags.includes(t)) {
      setFormData((p) => ({ ...p, tags: [...p.tags, t] }));
    }
    setTagInput(''); setShowSuggestions(false);
  };
  const handleRemoveTag = (t) => setFormData((p) => ({ ...p, tags: p.tags.filter(x => x !== t) }));

  const renderStars = () => Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return (
      <motion.button
        key={n}
        type="button"
        style={{ background: 'none', border: 0, cursor: 'pointer', color: n <= (hoverRating || formData.rating) ? '#ffd700' : 'rgba(255,255,255,.6)' }}
        onClick={() => handleChange('rating', n === formData.rating ? 0 : n)}
        onMouseEnter={() => setHoverRating(n)}
        onMouseLeave={() => setHoverRating(0)}
        title={`Оценка ${n}`}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Star size={24} fill={n <= (hoverRating || formData.rating) ? 'currentColor' : 'none'} />
      </motion.button>
    );
  });

  const applyResult = async (r) => {
    setIsResultSelected(true);
    handleChange('title', r.title || formData.title);
    handleChange('url', r.url || formData.url);
    handleChange('imageUrl', r.imageUrl || formData.imageUrl);
    if (r.year) handleChange('year', r.year);

    // Автоматически добавляем теги на основе жанров (без ограничений)
    if (r.tags && r.tags.length > 0) {
      const existingTags = formData.tags || [];
      const newTags = r.tags.filter(tag => !existingTags.includes(tag));
      if (newTags.length > 0) {
        handleChange('tags', [...existingTags, ...newTags]);
      }
    }

    // для сериалов TMDB — подтянем количество серий
    if (r.source === 'tmdb' && r.type === 'series') {
      const details = await getSeriesDetailsRU(r.id);
      if (details?.totalEpisodes) handleChange('totalEpisodes', details.totalEpisodes);
      if (details?.year && !r.year) handleChange('year', details.year);
    }

    // для манги Shikimori — подтянем количество глав
    if (r.source === 'shikimori' && r.type === 'manga') {
      const details = await getMangaDetailsRU(r.id);
      if (details?.totalEpisodes) handleChange('totalEpisodes', details.totalEpisodes);
      if (details?.year && !r.year) handleChange('year', details.year);
    }

    if (formData.type !== 'movie' && r.totalEpisodes) handleChange('totalEpisodes', r.totalEpisodes);

    setResults([]);
  };

  const getStatusOptions = (type) => [
    { value: 'planned', label: 'Запланировано' },
    { value: 'watching', label: type === 'manga' ? 'Читаю' : 'Смотрю' },
    { value: 'completed', label: type === 'manga' ? 'Прочитано' : 'Просмотрено' },
    { value: 'dropped', label: 'Брошено' }
  ];
  const typeOptions = [
    { value: 'anime', label: 'Аниме' },
    { value: 'movie', label: 'Фильм' },
    { value: 'series', label: 'Сериал' },
    { value: 'manga', label: 'Манга' }
  ];

  return (
    <ThemeProvider theme={getTheme(currentTheme)}>
      <Overlay 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Dialog 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
        >

          <Form onSubmit={handleSubmit}>
            {/* Основная информация */}
            <Section>
              
              <Row>
                <Grow>
                  <Label>Название</Label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Печатайте — поиск идёт автоматически…"
                    autoFocus
                  />
                </Grow>
              </Row>

              {isSearching && (
                <Helper>
                  <LoadingSpinner size={16} />
                  Ищем результаты...
                </Helper>
              )}
              {errorRU && (
                <Helper className="error">
                  <AlertCircle size={16} />
                  {errorRU}
                </Helper>
              )}
              {results.length > 0 && (
                <Results>
                  <AnimatePresence>
                    {results.map((r, index) => (
                      <ResultItem 
                        key={`${r.source}-${r.id}`} 
                        type="button" 
                        onClick={() => applyResult(r)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Poster>{r.imageUrl ? <img src={r.imageUrl} alt="" /> : null}</Poster>
                        <RText>
                          <RTitle>{r.title}</RTitle>
                          <RMeta>
                            {(r.year ? `${r.year} • ` : '') + (r.type === 'anime' ? 'Аниме' : r.type === 'movie' ? 'Фильм' : r.type === 'series' ? 'Сериал' : r.type === 'manga' ? 'Манга' : 'Неизвестно')}
                          </RMeta>
                        </RText>
                      </ResultItem>
                    ))}
                  </AnimatePresence>
                </Results>
              )}

              <Row>
                <Grow>
                  <Label>Ссылка</Label>
                  <Input
                    type="text"
                    value={formData.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                    placeholder="shikimori.one/... или themoviedb.org/..."
                  />
                </Grow>
              </Row>

              {(formData.imageUrl || formData.url || formData.year) && (
                <Thumb>
                  {formData.imageUrl ? <img src={formData.imageUrl} alt="" /> : <ImageIcon size={16} />}
                  {formData.year ? <span>Год: {formData.year}</span> : null}
                  {formData.url ? (
                    <a href={/^https?:\/\//.test(formData.url) ? formData.url : `https://${formData.url}`} target="_blank" rel="noreferrer">
                      Открыть источник <ExternalLink size={14} />
                    </a>
                  ) : null}
                </Thumb>
              )}
            </Section>

            {/* Тип и статус */}
            <Section>
              <SectionTitle>Тип и статус</SectionTitle>
              
              <Row>
                <Grow>
                  <Label>Тип</Label>
                  <Select value={formData.type} onChange={(e) => handleChange('type', e.target.value)}>
                    {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Grow>
                <Grow>
                  <Label>Статус</Label>
                  <Select value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
                    {getStatusOptions(formData.type).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Grow>
              </Row>

              {formData.type !== 'movie' && (
                <Row>
                  <Grow>
                    <Label>{formData.type === 'manga' ? 'Всего глав' : 'Всего серий'}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.totalEpisodes}
                      onChange={(e) => handleChange('totalEpisodes', e.target.value)}
                      placeholder={formData.type === 'manga' ? 'Всего глав' : 'Всего серий'}
                    />
                  </Grow>
                  {(formData.status === 'watching' || formData.status === 'completed' || formData.status === 'dropped') && (
                    <Grow>
                      <Label>{formData.type === 'manga' ? 'Прочитано глав' : 'Просмотрено серий'}</Label>
                      <Input
                        type="number"
                        min="0"
                        max={formData.totalEpisodes || undefined}
                        value={formData.watchedEpisodes}
                        onChange={(e) => handleChange('watchedEpisodes', e.target.value)}
                        placeholder="0"
                      />
                    </Grow>
                  )}
                </Row>
              )}
            </Section>

            {/* Оценка и теги */}
            <Section>
              <SectionTitle>Оценка и теги</SectionTitle>
              
              <div>
                <Label>Оценка</Label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  {renderStars()}
                  <span style={{ fontSize: 14, color: getTheme(currentTheme).textSecondary }}>
                    {formData.rating ? `${formData.rating}/10` : 'Поставить оценку'}
                  </span>
                </div>
              </div>

              <div>
                <Label>Теги</Label>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
                  padding: 12, background: getTheme(currentTheme).surfaceSecondary,
                  border: `1px solid ${getTheme(currentTheme).border}`, 
                  borderRadius: 12, marginTop: 8
                }}>
                  {formData.tags.map((t, i) => (
                    <span key={i} style={{ 
                      display:'inline-flex', alignItems:'center', gap:6, 
                      padding:'8px 12px', borderRadius:20, 
                      background: getTheme(currentTheme).accent, 
                      color:'#fff', fontSize:13, fontWeight: 600
                    }}>
                      <Tag size={12} /> {t}
                      <button type="button" onClick={() => handleRemoveTag(t)} style={{ 
                        border:0, background:'transparent', color:'#fff', cursor:'pointer',
                        padding: 2, borderRadius: 4, transition: 'background 0.2s ease'
                      }}>
                        <XIcon size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); handleAddTag(tagInput); }
                      if (e.key === 'Backspace' && !tagInput && formData.tags.length) handleRemoveTag(formData.tags.at(-1));
                    }}
                    placeholder="Добавить тег..."
                    style={{ 
                      flex:1, minWidth:120, border:0, background:'transparent', 
                      color:'inherit', outline:'none', fontSize:14, padding: 4
                    }}
                  />
                </div>
                {showSuggestions && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12 }}>
                    {predefinedTags
                      .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !formData.tags.includes(tag))
                      .slice(0,8)
                      .map(tag => (
                        <button key={tag} type="button" onMouseDown={() => handleAddTag(tag)}
                          style={{
                            padding:'6px 12px', borderRadius:16, 
                            border:`2px solid ${getTheme(currentTheme).border}`,
                            background: getTheme(currentTheme).surface, 
                            color:'inherit', cursor:'pointer', fontSize: 13,
                            transition: 'all 0.2s ease', fontWeight: 500
                          }}
                        >
                          {tag}
                        </button>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* Кнопки действий */}
            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <Button 
                type="button" 
                className="secondary" 
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                className="primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {item ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </Form>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}

export default AddDialog;
