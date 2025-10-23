import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Cloud, CloudOff, Download, Upload, Settings, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

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
const Body = styled.div` padding: 18px; display:flex; flex-direction: column; gap:18px; `;

const ProviderSelector = styled.div`
  display: flex; gap: 12px;
`;
const ProviderButton = styled.button`
  flex: 1; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: 600;
  background: ${p => p.$active ? p.theme.accent : p.theme.surface};
  color: ${p => p.$active ? 'white' : p.theme.text};
  border: 1px solid ${p => p.$active ? p.theme.accent : p.theme.border};
  transition: .2s;
  &:hover{ transform: translateY(-1px); }
`;

const StatusCard = styled.div`
  background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.border};
  border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;
`;
const StatusIcon = styled.div`
  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: ${p => p.$connected ? p.theme.success : p.theme.error}; color: white;
`;
const StatusText = styled.div`
  flex: 1;
  h4 { margin: 0; font-size: 14px; font-weight: 600; color: ${p => p.theme.text}; }
  p { margin: 4px 0 0; font-size: 12px; color: ${p => p.theme.textSecondary}; }
`;

const Input = styled.input`
  width: 100%; padding: 12px; border-radius: 12px;
  background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.border};
  color: ${p => p.theme.text}; font-size: 14px;
  &:focus{ outline: none; border-color: ${p => p.theme.accent}; }
`;

const ActionButton = styled.button`
  width: 100%; display: flex; gap: 10px; align-items: center; justify-content: center;
  background: ${p => p.$primary ? p.theme.accent : p.theme.surface}; 
  color: ${p => p.$primary ? 'white' : p.theme.text}; 
  border: 1px solid ${p => p.$primary ? p.theme.accent : p.theme.border};
  border-radius: 12px; padding: 12px; cursor: pointer; font-weight: 600; transition: .2s;
  &:hover{ 
    transform: translateY(-1px); 
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  &:disabled{ 
    opacity: 0.5; cursor: not-allowed; 
    &:hover{ transform: none; box-shadow: none; }
  }
`;

const Message = styled.div`
  padding: 12px; border-radius: 12px; font-size: 14px;
  background: ${p => {
    if (p.$type === 'success') return p.theme.success + '20';
    if (p.$type === 'error') return p.theme.error + '20';
    return p.theme.warning + '20';
  }};
  color: ${p => {
    if (p.$type === 'success') return p.theme.success;
    if (p.$type === 'error') return p.theme.error;
    return p.theme.warning;
  }};
`;

const Footer = styled.div`
  padding: 12px 18px; border-top: 1px solid ${p => p.theme.border}; 
  display: flex; gap: 12px; align-items: center; justify-content: space-between;
`;
const Note = styled.div` font-size: 12px; color: ${p => p.theme.textSecondary}; `;

export default function CloudSyncDialog({ open, onClose, darkMode }) {
  const [provider, setProvider] = useState('yandex'); // 'yandex' или 'google'
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
    if (open) {
      checkConnection();
    }
  }, [open, provider]);

  const checkConnection = async () => {
    if (!api) return;
    setIsLoading(true);
    try {
      if (provider === 'yandex') {
        const result = await api.checkYandexDiskConnection?.();
        setIsConnected(result?.connected || false);
        setYandexConnectedUser(result?.username || '');
      } else {
        const result = await api.checkGoogleDriveConnection?.();
        setIsConnected(result?.connected || false);
      }
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
        showMessage('✅ Подключено к Яндекс.Диску', 'success');
      } else {
        showMessage(`❌ Ошибка: ${result?.error || 'Неверные данные'}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Ошибка: ${error.message}`, 'error');
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
        showMessage('✅ Отключено от Яндекс.Диска', 'success');
      }
    } catch (error) {
      showMessage(`❌ Ошибка: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const syncToCloud = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = provider === 'yandex' 
        ? await api.syncToYandexDisk?.()
        : await api.syncToCloud?.();
        
      if (result?.success) {
        showMessage(result.message || '✅ Данные успешно сохранены', 'success');
      } else {
        showMessage(`❌ Ошибка: ${result?.error}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Ошибка: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromCloud = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = provider === 'yandex'
        ? await api.syncFromYandexDisk?.()
        : await api.syncFromCloud?.();
        
      if (result?.success) {
        showMessage(result.message || '✅ Данные успешно восстановлены', 'success');
      } else {
        showMessage(`❌ Ошибка: ${result?.error}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Ошибка: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <Overlay $open={open} onClick={onClose}>
        <Dialog onClick={e => e.stopPropagation()}>
          <Header>
            <Title>☁️ Облачная синхронизация</Title>
            <Close onClick={onClose}><X size={18} /></Close>
          </Header>

          <Body>
            <ProviderSelector>
              <ProviderButton 
                $active={provider === 'yandex'} 
                onClick={() => setProvider('yandex')}
              >
                Яндекс.Диск
              </ProviderButton>
              <ProviderButton 
                $active={provider === 'google'} 
                onClick={() => setProvider('google')}
              >
                Google Drive
              </ProviderButton>
            </ProviderSelector>

            <StatusCard>
              <StatusIcon $connected={isConnected}>
                {isConnected ? <Cloud size={20} /> : <CloudOff size={20} />}
              </StatusIcon>
              <StatusText>
                <h4>{isConnected ? 'Подключено' : 'Не подключено'}</h4>
                <p>
                  {provider === 'yandex' ? 'Яндекс.Диск' : 'Google Drive'}
                  {isConnected && yandexConnectedUser && ` (${yandexConnectedUser})`}
                </p>
              </StatusText>
            </StatusCard>

            {message && (
              <Message $type={messageType}>{message}</Message>
            )}

            {provider === 'yandex' && !isConnected && (
              <>
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
                  $primary 
                  onClick={connectToYandex} 
                  disabled={isLoading}
                >
                  <Cloud size={18} />
                  {isLoading ? 'Подключение...' : 'Подключиться'}
                </ActionButton>
                <Note>
                  💡 Используйте <a href="https://id.yandex.ru/security/app-passwords" target="_blank" style={{color: 'inherit'}}>пароль приложения</a> из настроек Яндекса
                </Note>
              </>
            )}

            {provider === 'google' && !isConnected && (
              <>
                <Message $type="warning">
                  ⚠️ Google Drive требует настройки API. См. GOOGLE_DRIVE_SETUP.md
                </Message>
              </>
            )}

            {isConnected && (
              <>
                <ActionButton $primary onClick={syncToCloud} disabled={isLoading}>
                  <Upload size={18} />
                  {isLoading ? 'Сохранение...' : 'Сохранить в облако'}
                </ActionButton>

                <ActionButton onClick={syncFromCloud} disabled={isLoading}>
                  <Download size={18} />
                  {isLoading ? 'Восстановление...' : 'Восстановить из облака'}
                </ActionButton>

                <ActionButton onClick={provider === 'yandex' ? disconnectFromYandex : null} disabled={isLoading}>
                  <CloudOff size={18} />
                  Отключить
                </ActionButton>
              </>
            )}
          </Body>

          <Footer>
            <Note>Данные шифруются перед отправкой</Note>
          </Footer>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}

