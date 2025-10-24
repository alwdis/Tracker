import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { Star, Tag, X as XIcon, Image as ImageIcon, ExternalLink, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { searchRU, getSeriesDetailsRU } from '../../lib/ruSources';

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

// === темы в стиле CloudSyncDialog ===
const lightTheme = {
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#334155',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  accent: '#667eea',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  border: 'rgba(255, 255, 255, 0.1)',
  accent: '#667eea',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444'
};

// === улучшенные стили ===
const Overlay = styled.div`
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

const Dialog = styled.div`
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
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.accent};
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
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 14px;
  transition: border-color 0.2s ease;
  appearance: none;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
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

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  }

  &.secondary {
    background: ${props => props.theme.surface};
    color: ${props => props.theme.text};
    border: 1px solid ${props => props.theme.border};

    &:hover:not(:disabled) {
      background: ${props => props.theme.background};
      transform: translateY(-1px);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
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

const ResultItem = styled.button`
  display: flex;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px;
  cursor: pointer;
  border: 0;
  background: transparent;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.background};
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

function AddDialog({ item, onClose, onSave, isDarkTheme }) {
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
      return alert('Пожалуйста, укажите количество серий');
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
    if (t && !formData.tags.includes(t)) setFormData((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput(''); setShowSuggestions(false);
  };
  const handleRemoveTag = (t) => setFormData((p) => ({ ...p, tags: p.tags.filter(x => x !== t) }));

  const renderStars = () => Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return (
      <button
        key={n}
        type="button"
        style={{ background: 'none', border: 0, cursor: 'pointer', color: n <= (hoverRating || formData.rating) ? '#ffd700' : 'rgba(255,255,255,.6)' }}
        onClick={() => handleChange('rating', n === formData.rating ? 0 : n)}
        onMouseEnter={() => setHoverRating(n)}
        onMouseLeave={() => setHoverRating(0)}
        title={`Оценка ${n}`}
      >
        <Star size={24} fill={n <= (hoverRating || formData.rating) ? 'currentColor' : 'none'} />
      </button>
    );
  });

  const applyResult = async (r) => {
    setIsResultSelected(true);
    handleChange('title', r.title || formData.title);
    handleChange('url', r.url || formData.url);
    handleChange('imageUrl', r.imageUrl || formData.imageUrl);
    if (r.year) handleChange('year', r.year);

    // для сериалов TMDB — подтянем количество серий
    if (r.source === 'tmdb' && r.type === 'series') {
      const details = await getSeriesDetailsRU(r.id);
      if (details?.totalEpisodes) handleChange('totalEpisodes', details.totalEpisodes);
      if (details?.year && !r.year) handleChange('year', details.year);
    }

    if (formData.type !== 'movie' && r.totalEpisodes) handleChange('totalEpisodes', r.totalEpisodes);

    setResults([]);
  };

  const statusOptions = [
    { value: 'planned', label: 'Запланировано' },
    { value: 'watching', label: 'Смотрю' },
    { value: 'completed', label: 'Просмотрено' },
    { value: 'dropped', label: 'Брошено' }
  ];
  const typeOptions = [
    { value: 'anime', label: 'Аниме' },
    { value: 'movie', label: 'Фильм' },
    { value: 'series', label: 'Сериал' }
  ];

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <Overlay onClick={onClose}>
        <Dialog onClick={(e) => e.stopPropagation()}>

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
                  {results.map((r) => (
                    <ResultItem key={`${r.source}-${r.id}`} type="button" onClick={() => applyResult(r)}>
                      <Poster>{r.imageUrl ? <img src={r.imageUrl} alt="" /> : null}</Poster>
                      <RText>
                        <RTitle>{r.title}</RTitle>
                        <RMeta>
                          {(r.year ? `${r.year} • ` : '') + (r.type === 'anime' ? 'Аниме' : r.type === 'movie' ? 'Фильм' : 'Сериал')}
                        </RMeta>
                      </RText>
                    </ResultItem>
                  ))}
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
                    {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Grow>
              </Row>

              {formData.type !== 'movie' && (
                <Row>
                  <Grow>
                    <Label>Всего серий</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.totalEpisodes}
                      onChange={(e) => handleChange('totalEpisodes', e.target.value)}
                      placeholder="Всего серий"
                    />
                  </Grow>
                  {(formData.status === 'watching' || formData.status === 'completed' || formData.status === 'dropped') && (
                    <Grow>
                      <Label>Просмотрено серий</Label>
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
                  <span style={{ fontSize: 14, color: isDarkTheme ? 'rgba(255,255,255,.7)' : '#64748b' }}>
                    {formData.rating ? `${formData.rating}/10` : 'Поставить оценку'}
                  </span>
                </div>
              </div>

              <div>
                <Label>Теги</Label>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
                  padding: 12, background: isDarkTheme ? '#2d2d2d' : '#f8fafc',
                  border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,.1)' : '#e2e8f0'}`, 
                  borderRadius: 12, marginTop: 8
                }}>
                  {formData.tags.map((t, i) => (
                    <span key={i} style={{ 
                      display:'inline-flex', alignItems:'center', gap:6, 
                      padding:'8px 12px', borderRadius:20, 
                      background: isDarkTheme ? '#667eea' : '#667eea', 
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
                            border:`2px solid ${isDarkTheme ? 'rgba(255,255,255,.1)' : '#e2e8f0'}`,
                            background: isDarkTheme ? '#1e293b' : '#fff', 
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
              <Button type="button" className="secondary" onClick={onClose}>Отмена</Button>
              <Button type="submit" className="primary">
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
