import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Download, Upload, Clock } from 'lucide-react';

const light = {
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
const dark = {
  background: '#0b1220',
  surface: '#0f172a',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: '#1f2937',
  accent: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: ${p => (p.$open ? 'flex' : 'none')}; align-items: center; justify-content: center; z-index: 9999;
`;
const Dialog = styled.div`
  width: 640px; max-width: calc(100vw - 24px);
  background: ${p => p.theme.background}; border: 1px solid ${p => p.theme.border};
  border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.35);
`;
const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding: 14px 18px; border-bottom: 1px solid ${p => p.theme.border};
`;
const Title = styled.h3`
  font-size:16px; font-weight:700; color:${p => p.theme.text};
`;
const Close = styled.button`
  border:none; background:transparent; color:${p => p.theme.textSecondary}; cursor:pointer; padding:6px; border-radius:8px;
  &:hover{ background:${p => p.theme.surface}; }
`;
const Body = styled.div` padding: 18px; display:flex; gap:18px; `;
const Col = styled.div` flex:1; `;
const SectionTitle = styled.div`
  font-weight:700; margin-bottom:10px; color:${p => p.theme.textSecondary}; display:flex; gap:8px; align-items:center;
`;
const Action = styled.button`
  width:100%; display:flex; gap:10px; align-items:center; justify-content:center;
  background:${p => p.theme.surface}; color:${p => p.theme.text}; border:1px solid ${p => p.theme.border};
  border-radius:12px; padding:12px; cursor:pointer; font-weight:600; transition:.2s;
  &:hover{ border-color:${p => p.theme.accent}; transform: translateY(-1px); }
`;
const List = styled.div`
  max-height: 260px; overflow:auto; border:1px solid ${p => p.theme.border}; border-radius:12px;
`;
const Row = styled.div`
  display:flex; gap:10px; padding:10px 12px; align-items:center; justify-content:space-between;
  border-bottom:1px solid ${p => p.theme.border};
  &:last-child{ border-bottom:none; }
`;
const Meta = styled.div` display:flex; gap:10px; align-items:center; color:${p => p.theme.textSecondary}; `;
const Small = styled.div` font-size:12px; color:${p => p.theme.textSecondary}; `;
const Badge = styled.span`
  font-size:12px; padding:2px 8px; border-radius:999px; background:${p => p.theme.surface}; border:1px solid ${p => p.theme.border}; color:${p => p.theme.textSecondary};
`;
const Footer = styled.div`
  padding: 12px 18px; border-top: 1px solid ${p => p.theme.border}; display:flex; gap:12px; align-items:center; justify-content:space-between;
`;
const Note = styled.div` font-size:12px; color:${p => p.theme.textSecondary}; `;
const InlineBtn = styled.button`
  border:none; background:transparent; color:${p => p.theme.accent}; cursor:pointer; font-weight:700;
`;

export default function BackupDialog({ open, onClose, darkMode }) {
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState(null);

  const api = window.electronAPI;

  const refreshList = async () => {
    if (!api) return;
    setBusy(true);
    try {
      const items = await api.getAvailableBackups();
      setList(Array.isArray(items) ? items : []);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { if (open) refreshList(); }, [open]);

  const createBackup = async () => {
    if (!api) return;
    setBusy(true); setMsg(null);
    const res = await api.createManualBackup();
    setBusy(false);
    if (res?.success) {
      setMsg(`✅ Бэкап создан: ${res.fileName}`);
      await refreshList();
    } else {
      setMsg(`❌ Ошибка бэкапа: ${res?.error || 'Unknown error'}`);
    }
  };

  const restoreFromFile = async () => {
    if (!api) return;
    const file = await api.selectBackupFile();
    if (!file) return;
    setBusy(true); setMsg(null);
    const res = await api.restoreFromBackup(file);
    setBusy(false);
    if (res?.success) {
      setMsg(`✅ Восстановлено элементов: ${res.itemCount}`);
      setTimeout(() => window.location.reload(), 600);
    } else {
      setMsg(`❌ Ошибка восстановления: ${res?.error || 'Unknown error'}`);
    }
  };

  const restoreEntry = async (entry) => {
    if (!api || !entry?.filePath) return;
    setBusy(true); setMsg(null);
    const res = await api.restoreFromBackup(entry.filePath);
    setBusy(false);
    if (res?.success) {
      setMsg(`✅ Восстановлено элементов: ${res.itemCount}`);
      setTimeout(() => window.location.reload(), 600);
    } else {
      setMsg(`❌ Ошибка восстановления: ${res?.error || 'Unknown error'}`);
    }
  };

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <Overlay $open={open} onMouseDown={onClose}>
        <Dialog onMouseDown={(e)=>e.stopPropagation()}>
          <Header>
            <Title>Управление бэкапами</Title>
            <Close onClick={onClose}><X size={18}/></Close>
          </Header>

          <Body>
            <Col>
              <SectionTitle><Download size={16}/> Действия</SectionTitle>
              <Action onClick={createBackup} disabled={busy}>
                <Download size={18}/> Создать бэкап на рабочем столе
              </Action>
              <div style={{height:10}}/>
              <Action onClick={restoreFromFile} disabled={busy}>
                <Upload size={18}/> Восстановить из файла…
              </Action>
              <div style={{height:10}}/>
              <Action onClick={refreshList} disabled={busy}>
                <Clock size={18}/> Показать доступные бэкапы
              </Action>
            </Col>

            <Col>
              <SectionTitle><Clock size={16}/> Последние бэкапы</SectionTitle>
              <List>
                {list.length === 0 && <Row><Small>Бэкапов пока нет.</Small></Row>}
                {list.map((b,i) => (
                  <Row key={i}>
                    <div>
                      <div style={{fontWeight:700}}>{b.fileName || 'backup.json'}</div>
                      <Small>{new Date(b.date||b.backupDate).toLocaleString()} • {Math.round((b.size||0)/1024)} KB</Small>
                    </div>
                    <Meta>
                      <Badge>{b.itemCount ?? 0}</Badge>
                      <InlineBtn onClick={()=>restoreEntry(b)}>Восстановить</InlineBtn>
                    </Meta>
                  </Row>
                ))}
              </List>
            </Col>
          </Body>

          <Footer>
            <Note>
              {busy ? 'Работаем…' : (msg || 'Бэкап хранится локально. Рекомендуется периодически копировать файл бэкапа на внешний носитель.')}
            </Note>
            <InlineBtn onClick={onClose}>Закрыть</InlineBtn>
          </Footer>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}
