import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Download, Upload, Clock, FileText, Database, Check, AlertTriangle } from 'lucide-react';

// Теми для диалогов
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
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  flex: 1;
  color: ${props => props.theme.text};
`;

const CloseButton = styled.button`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 8px;
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.accent};
    color: white;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: ${props => props.theme.surface};
  border: 2px solid ${props => props.theme.border};
  border-radius: 16px;
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.accent};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.accent}20;
  border-radius: 12px;
  color: ${props => props.theme.accent};
`;

const ActionText = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const ActionDescription = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  text-align: center;
`;

const BackupList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  background: ${props => props.theme.surface};
`;

const BackupItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.border};
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.background};
  }
`;

const BackupInfo = styled.div`
  flex: 1;
`;

const BackupName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 4px;
`;

const BackupMeta = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  display: flex;
  gap: 12px;
  align-items: center;
`;

const BackupActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Badge = styled.span`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.theme.accent}20;
  color: ${props => props.theme.accent};
  font-weight: 600;
`;

const RestoreButton = styled.button`
  background: ${props => props.theme.accent};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.textSecondary};
`;

const EmptyIcon = styled.div`
  margin-bottom: 12px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 14px;
`;

const Message = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;

  ${props => props.$type === 'success' && `
    background: ${props.theme.success}20;
    color: ${props.theme.success};
    border: 1px solid ${props.theme.success}40;
  `}
  
  ${props => props.$type === 'error' && `
    background: ${props.theme.error}20;
    color: ${props.theme.error};
    border: 1px solid ${props.theme.error}40;
  `}
  
  ${props => props.$type === 'info' && `
    background: ${props.theme.accent}20;
    color: ${props.theme.accent};
    border: 1px solid ${props.theme.accent}40;
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  }

  &.secondary {
    background: ${props => props.theme.surface};
    color: ${props => props.theme.text};
    border: 1px solid ${props => props.theme.border};

    &:hover {
      background: ${props => props.theme.background};
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const Footer = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.border};
  text-align: center;
`;

const FooterText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  line-height: 1.5;
`;

export default function BackupDialog({ open, onClose, darkMode }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('info');

  const api = window.electronAPI;

  useEffect(() => { 
    if (open) {
      setMsg(null);
    }
  }, [open]);

  const createBackup = async () => {
    if (!api) return;
    setBusy(true); 
    setMsg(null);
    try {
      const res = await api.createManualBackup();
      if (res?.success) {
        setMsg(`Бэкап создан: ${res.fileName}`);
        setMsgType('success');
      } else {
        setMsg(`Ошибка бэкапа: ${res?.error || 'Unknown error'}`);
        setMsgType('error');
      }
    } catch (error) {
      setMsg(`Ошибка: ${error.message}`);
      setMsgType('error');
    } finally {
      setBusy(false);
    }
  };

  const restoreFromFile = async () => {
    if (!api) return;
    try {
      const file = await api.selectBackupFile();
      if (!file || file.canceled) return;
      
      setBusy(true); 
      setMsg(null);
      const res = await api.restoreFromBackup(file.filePath);
      setBusy(false);
      
      if (res?.success) {
        setMsg(`Восстановлено элементов: ${res.itemCount}`);
        setMsgType('success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMsg(`Ошибка восстановления: ${res?.error || 'Unknown error'}`);
        setMsgType('error');
      }
    } catch (error) {
      setMsg(`Ошибка: ${error.message}`);
      setMsgType('error');
      setBusy(false);
    }
  };


  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Неизвестная дата';
    }
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Overlay onClick={onClose}>
        <Dialog onClick={e => e.stopPropagation()}>
          <Header>
            <Title>Управление бэкапами</Title>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          <Content>
            {msg && (
              <Message $type={msgType}>
                {msgType === 'success' && <Check size={18} />}
                {msgType === 'error' && <AlertTriangle size={18} />}
                {msgType === 'info' && <Clock size={18} />}
                {msg}
              </Message>
            )}

            <Section>
              <SectionTitle>
                <Database size={20} />
                Действия с бэкапами
              </SectionTitle>
              <ActionGrid>
                <ActionButton onClick={createBackup} disabled={busy}>
                  <ActionIcon>
                    <Download size={24} />
                  </ActionIcon>
                  <ActionText>Создать бэкап</ActionText>
                  <ActionDescription>
                    Сохранить текущие данные
                  </ActionDescription>
                </ActionButton>

                <ActionButton onClick={restoreFromFile} disabled={busy}>
                  <ActionIcon>
                    <Upload size={24} />
                  </ActionIcon>
                  <ActionText>Восстановить из файла</ActionText>
                  <ActionDescription>
                    Выбрать файл бэкапа
                  </ActionDescription>
                </ActionButton>
              </ActionGrid>
            </Section>
          </Content>

          <Footer>
            <FooterText>
              Бэкапы сохраняются локально в папке приложения.<br />
              Для восстановления данных из файла, выберите файл бэкапа.
            </FooterText>
          </Footer>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}
