import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Star, Tag, X as XIcon, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { searchRU, getSeriesDetailsRU } from '../../lib/ruSources';

// === темы (как раньше) ===
const lightTheme = {
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#334155',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  accent: '#667eea',
  success: '#10b981'
};

const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.8)',
  border: 'rgba(255,255,255,0.1)',
  accent: '#667eea',
  success: '#22c55e'
};

// === стили (короче) ===
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.8); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const Dialog = styled.div`
  background: ${p=>p.theme.background}; border-radius: 24px; padding: 32px; width: 90%; max-width: 560px;
  border: 1px solid ${p=>p.theme.border}; box-shadow: 0 25px 50px rgba(0,0,0,.5);
  max-height: 90vh; overflow-y: auto;
`;
const Header = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;`;
const Title = styled.h2`
  font-size: 24px; font-weight: 700;
  background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip:text;
  color: ${p=>p.theme.text};
`;
const CloseButton = styled.button`
  background:${p=>p.theme.surface}; border:1px solid ${p=>p.theme.border}; border-radius:12px; padding:8px; color:${p=>p.theme.text};
  cursor:pointer; transition:.3s; &:hover{background:${p=>p.theme.accent}; color:#fff;}
`;
const Form = styled.form`display:flex; flex-direction:column; gap:16px;`;
const Row = styled.div`display:flex; gap:12px; align-items:flex-end;`;
const Grow = styled.div`flex:1;`;
const Label = styled.label`font-size:14px; font-weight:600; color:${p=>p.theme.text};`;
const Input = styled.input`
  width:100%; background:${p=>p.theme.surface}; border:1px solid ${p=>p.theme.border}; border-radius:12px; padding:14px;
  color:${p=>p.theme.text}; font-size:16px; transition:.2s;
  &:focus{outline:none; border-color:${p=>p.theme.accent}; background:${p=>p.theme.background};}
  &::placeholder{color:${p=>p.theme.textSecondary};}
`;
const Select = styled.select`
  width:100%; background:${p=>p.theme.surface}; border:1px solid ${p=>p.theme.border}; border-radius:12px; padding:14px;
  color:${p=>p.theme.text}; font-size:16px; transition:.2s; appearance:none;
  &:focus{outline:none; border-color:${p=>p.theme.accent}; background:${p=>p.theme.background};}
`;
const Button = styled.button`
  padding:12px 16px; border:none; border-radius:12px; font-weight:700; cursor:pointer; transition:.2s;
  &.primary{ background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#fff; }
  &.secondary{ background:${p=>p.theme.surface}; color:${p=>p.theme.text}; border:1px solid ${p=>p.theme.border}; }
  &:hover{ transform: translateY(-1px); }
`;
const Helper = styled.div`font-size:12px; color:${p=>p.theme.textSecondary};`;

const Results = styled.div`
  margin-top:8px; border:1px solid ${p=>p.theme.border}; border-radius:12px; overflow:hidden;
`;
const ResultItem = styled.button`
  display:flex; gap:12px; width:100%; text-align:left; padding:10px; cursor:pointer;
  border:0; background:${p=>p.theme.surface};
  &:hover{ background:${p=>p.theme.background}; }
`;
const Poster = styled.div`
  width:42px; height:63px; border-radius:8px; overflow:hidden; background:${p=>p.theme.surface};
  img{ width:100%; height:100%; object-fit:cover; display:block; }
`;
const RText = styled.div`display:flex; flex-direction:column; gap:4px;`;
const RTitle = styled.div`font-size:14px; font-weight:700; color:${p=>p.theme.text};`;
const RMeta = styled.div`font-size:12px; color:${p=>p.theme.textSecondary};`;

const Thumb = styled.div`
  display:flex; align-items:center; gap:10px; font-size:12px; color:${p=>p.theme.textSecondary};
  img{ width:42px; height:63px; object-fit:cover; border-radius:8px; border:1px solid ${p=>p.theme.border}; }
  a{ color:${p=>p.theme.accent}; display:inline-flex; align-items:center; gap:6px; text-decoration:none; }
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
    if (q.length < 2) {
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
  }, [formData.title, formData.type]);

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

  const handleChange = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

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
          <Header>
            <Title>{item ? 'Редактировать тайтл' : 'Добавить тайтл'}</Title>
            <CloseButton onClick={onClose}><X size={20} /></CloseButton>
          </Header>

          <Form onSubmit={handleSubmit}>
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

            {isSearching && <Helper>Ищем…</Helper>}
            {errorRU && <Helper style={{ color: '#ef4444' }}>{errorRU}</Helper>}
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

            <div>
              <Label>Оценка</Label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {renderStars()}
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>
                  {formData.rating ? `${formData.rating}/10` : 'Поставить оценку'}
                </span>
              </div>
            </div>

            <div>
              <Label>Теги</Label>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
                padding: 12, background: isDarkTheme ? '#2d2d2d' : '#f8fafc',
                border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,.1)' : '#e2e8f0'}`, borderRadius: 12
              }}>
                {formData.tags.map((t, i) => (
                  <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:16, background:'#667eea', color:'#fff', fontSize:12 }}>
                    <Tag size={12} /> {t}
                    <button type="button" onClick={() => handleRemoveTag(t)} style={{ border:0, background:'transparent', color:'#fff', cursor:'pointer' }}>
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
                  style={{ flex:1, minWidth:120, border:0, background:'transparent', color:'inherit', outline:'none', fontSize:14 }}
                />
              </div>
              {showSuggestions && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                  {predefinedTags
                    .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !formData.tags.includes(tag))
                    .slice(0,8)
                    .map(tag => (
                      <button key={tag} type="button" onMouseDown={() => handleAddTag(tag)}
                        style={{
                          padding:'4px 8px', borderRadius:12, border:`1px solid ${isDarkTheme ? 'rgba(255,255,255,.1)' : '#e2e8f0'}`,
                          background: isDarkTheme ? '#2d2d2d' : '#fff', color:'inherit', cursor:'pointer'
                        }}
                      >
                        {tag}
                      </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <Button type="button" className="secondary" onClick={onClose}>Отмена</Button>
              <Button type="submit" className="primary">{item ? 'Сохранить' : 'Добавить'}</Button>
            </div>
          </Form>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}

export default AddDialog;
