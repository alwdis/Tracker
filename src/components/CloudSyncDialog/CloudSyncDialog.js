import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Cloud, CloudOff, Download, Upload, Settings, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

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
  max-width: 500px;
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

const StatusCard = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$connected ? props.theme.success : props.theme.error};
  color: white;
`;

const StatusText = styled.div`
  flex: 1;
  
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.text};
  }
  
  p {
    margin: 4px 0 0;
    font-size: 14px;
    color: ${props => props.theme.textSecondary};
  }
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

const ActionButton = styled.button`
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

const Note = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  text-align: center;
  line-height: 1.5;
  
  a {
    color: ${props => props.theme.accent};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.border};
  text-align: center;
`;

export default function CloudSyncDialog({ open, onClose, darkMode }) {
  const [provider, setProvider] = useState('yandex'); // только 'yandex'
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  
  // Yandex.Disk credentials
  const [yandexUsername, setYandexUsername] = useState('');
  const [yandexPassword, setYandexPassword] = useState('');
  const [yandexConnectedUser, setYandexConnectedUser] = useState('');

  const api = window.electronAPI;

  useEffect(() => {
    console.log('CloudSyncDialog: useEffect triggered', { open, provider });
    if (open) {
      checkConnection();
      setMessage(null);
    }
  }, [open, provider]);

  const checkConnection = async () => {
    if (!api) return;
    setIsLoading(true);
    try {
      const result = await api.checkYandexDiskConnection?.();
      setIsConnected(result?.connected || false);
      setYandexConnectedUser(result?.username || '');
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToYandex = async () => {
    if (!yandexUsername || !yandexPassword) {
      showMessage('Введите email и пароль', 'error');
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await api.connectToYandexDisk?.(yandexUsername, yandexPassword);
      if (result?.success) {
        setIsConnected(true);
        setYandexConnectedUser(yandexUsername);
        setYandexPassword('');
        showMessage('Подключено к Яндекс.Диску', 'success');
      } else {
               showMessage(`Ошибка: ${result?.error || 'Неверные данные'}`, 'error');
      }
    } catch (error) {
      showMessage(`Ошибка: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFromYandex = async () => {
    setIsLoading(true);
    try {
      const result = await api.disconnectFromYandexDisk?.();
      if (result?.success) {
        setIsConnected(false);
        setYandexConnectedUser('');
        showMessage('Отключено от Яндекс.Диска', 'success');
      }
    } catch (error) {
      showMessage(`Ошибка: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const syncToCloud = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await api.syncToYandexDisk?.();
      if (result?.success) {
        showMessage(result.message || 'Данные успешно сохранены', 'success');
      } else {
        showMessage(`❌ Ошибка: ${result?.error}`, 'error');
      }
    } catch (error) {
      showMessage(`Ошибка: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromCloud = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await api.syncFromYandexDisk?.();
      if (result?.success) {
        showMessage(result.message || 'Данные успешно восстановлены', 'success');
      } else {
        showMessage(`❌ Ошибка: ${result?.error}`, 'error');
      }
    } catch (error) {
      showMessage(`Ошибка: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const handleClose = (event) => {
    console.log('CloudSyncDialog: Closing dialog', event);
    setMessage(null);
    onClose();
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Overlay onClick={handleClose}>
        <Dialog onClick={e => e.stopPropagation()}>
          <Header>
            <Title>☁️ Облачная синхронизация</Title>
            <CloseButton onClick={handleClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          <Content>
            <Section>
              <SectionTitle>
                <Cloud size={20} />
                Статус подключения
              </SectionTitle>
              <StatusCard>
                <StatusIcon $connected={isConnected}>
                  {isConnected ? <Cloud size={24} /> : <CloudOff size={24} />}
                </StatusIcon>
                <StatusText>
                  <h4>{isConnected ? 'Подключено' : 'Не подключено'}</h4>
                  <p>
                    Яндекс.Диск
                    {isConnected && yandexConnectedUser && ` (${yandexConnectedUser})`}
                  </p>
                </StatusText>
              </StatusCard>
            </Section>

            {message && (
              <Message $type={messageType}>
                {messageType === 'success' && <CheckCircle size={18} />}
                {messageType === 'error' && <AlertCircle size={18} />}
                {messageType === 'info' && <Settings size={18} />}
                {message}
              </Message>
            )}

            {!isConnected && (
              <Section>
                <SectionTitle>
                  <Settings size={20} />
                  Подключение к Яндекс.Диску
                </SectionTitle>
                <Input
                  type="email"
                  placeholder="Email (example@yandex.ru)"
                  value={yandexUsername}
                  onChange={(e) => setYandexUsername(e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Пароль приложения"
                  value={yandexPassword}
                  onChange={(e) => setYandexPassword(e.target.value)}
                  disabled={isLoading}
                />
                <ActionButton 
                  className="primary"
                  onClick={connectToYandex} 
                  disabled={isLoading || !yandexUsername || !yandexPassword}
                >
                  <Cloud size={18} />
                  {isLoading ? 'Подключение...' : 'Подключиться'}
                </ActionButton>
                <Note>
                  💡 Используйте <a href="https://id.yandex.ru/security/app-passwords" target="_blank" rel="noopener noreferrer">пароль приложения</a> из настроек Яндекса
                </Note>
              </Section>
            )}

            {isConnected && (
              <Section>
                <SectionTitle>
                  <Upload size={20} />
                  Синхронизация данных
                </SectionTitle>
                <ActionButton className="primary" onClick={syncToCloud} disabled={isLoading}>
                  <Upload size={18} />
                  {isLoading ? 'Сохранение...' : 'Сохранить в облако'}
                </ActionButton>

                <ActionButton className="secondary" onClick={syncFromCloud} disabled={isLoading}>
                  <Download size={18} />
                  {isLoading ? 'Восстановление...' : 'Восстановить из облака'}
                </ActionButton>

                <ActionButton className="secondary" onClick={disconnectFromYandex} disabled={isLoading}>
                  <CloudOff size={18} />
                  Отключить
                </ActionButton>
              </Section>
            )}
          </Content>

          <Footer>
            <Note>
              Данные шифруются перед отправкой в облако
            </Note>
          </Footer>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}

