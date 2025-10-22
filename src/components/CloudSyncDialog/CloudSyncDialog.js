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
const SettingsSection = styled.div`
  background: ${p => p.theme.surface}; border: 1px solid ${p => p.theme.border};
  border-radius: 12px; padding: 16px;
`;
const SettingRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
  &:last-child{ margin-bottom: 0; }
`;
const SettingLabel = styled.div`
  font-size: 14px; color: ${p => p.theme.text};
`;
const Toggle = styled.button`
  width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer;
  background: ${p => p.$active ? p.theme.accent : p.theme.border}; position: relative;
  transition: all 0.2s;
  &::after {
    content: ''; position: absolute; top: 2px; left: ${p => p.$active ? '22px' : '2px'};
    width: 20px; height: 20px; border-radius: 50%; background: white;
    transition: all 0.2s;
  }
`;
const Footer = styled.div`
  padding: 12px 18px; border-top: 1px solid ${p => p.theme.border}; 
  display: flex; gap: 12px; align-items: center; justify-content: space-between;
`;
const Note = styled.div` font-size: 12px; color: ${p => p.theme.textSecondary}; `;
const InlineBtn = styled.button`
  border: none; background: transparent; color: ${p => p.theme.accent}; cursor: pointer; font-weight: 700;
`;

export default function CloudSyncDialog({ open, onClose, darkMode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [message, setMessage] = useState(null);

  const api = window.electronAPI;

  useEffect(() => {
    if (open) {
      checkConnection();
      loadSettings();
    }
  }, [open]);

  const checkConnection = async () => {
    if (!api) return;
    setIsLoading(true);
    try {
      // Проверяем подключение к Google Drive
      const result = await api.checkGoogleDriveConnection?.();
      setIsConnected(result?.connected || false);
      setLastSync(result?.lastSync || null);
      
      if (result?.needsSetup) {
        setMessage('⚠️ Google Drive API не настроен. См. инструкцию в GOOGLE_DRIVE_SETUP.md');
      } else if (result?.needsAuth) {
        setMessage('🔐 Требуется авторизация в Google Drive');
      } else if (result?.error) {
        setMessage('❌ Ошибка подключения: ' + result.error);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      setMessage('❌ Ошибка проверки подключения: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!api) return;
    try {
      const settings = await api.getCloudSyncSettings?.();
      setAutoSync(settings?.autoSync ?? true);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const connectToGoogleDrive = async () => {
    if (!api) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await api.connectToGoogleDrive?.();
      if (result?.success) {
        setIsConnected(true);
        setMessage(result.message || '✅ Успешно подключено к Google Drive');
      } else {
        if (result?.needsSetup) {
          setMessage('⚠️ Google Drive API не настроен. См. инструкцию в GOOGLE_DRIVE_SETUP.md');
        } else {
          setMessage(`❌ Ошибка подключения: ${result?.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      setMessage(`❌ Ошибка подключения: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFromGoogleDrive = async () => {
    if (!api) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await api.disconnectFromGoogleDrive?.();
      if (result?.success) {
        setIsConnected(false);
        setMessage('✅ Отключено от Google Drive');
      } else {
        setMessage(`❌ Ошибка отключения: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`❌ Ошибка отключения: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const syncToCloud = async () => {
    if (!api) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await api.syncToCloud?.();
      if (result?.success) {
        setLastSync(new Date());
        setMessage('✅ Данные синхронизированы с облаком');
      } else {
        setMessage(`❌ Ошибка синхронизации: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`❌ Ошибка синхронизации: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromCloud = async () => {
    if (!api) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await api.syncFromCloud?.();
      if (result?.success) {
        setLastSync(new Date());
        setMessage('✅ Данные загружены из облака');
        // Перезагружаем страницу для обновления данных
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage(`❌ Ошибка загрузки: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`❌ Ошибка загрузки: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoSync = async () => {
    const newValue = !autoSync;
    setAutoSync(newValue);
    if (api?.setCloudSyncSettings) {
      try {
        await api.setCloudSyncSettings({ autoSync: newValue });
      } catch (error) {
        console.error('Failed to save settings:', error);
        setAutoSync(!newValue); // Revert on error
      }
    }
  };

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <Overlay $open={open} onMouseDown={onClose}>
        <Dialog onMouseDown={(e)=>e.stopPropagation()}>
          <Header>
            <Title>Облачная синхронизация</Title>
            <Close onClick={onClose}><X size={18}/></Close>
          </Header>

          <Body>
            <StatusCard>
              <StatusIcon $connected={isConnected}>
                {isConnected ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
              </StatusIcon>
              <StatusText>
                <h4>{isConnected ? 'Подключено к Google Drive' : 'Не подключено'}</h4>
                <p>
                  {isConnected 
                    ? lastSync ? `Последняя синхронизация: ${new Date(lastSync).toLocaleString()}` : 'Готово к синхронизации'
                    : 'Подключитесь к Google Drive для синхронизации данных'
                  }
                </p>
              </StatusText>
              <ActionButton 
                onClick={isConnected ? disconnectFromGoogleDrive : connectToGoogleDrive}
                disabled={isLoading}
                style={{ width: 'auto', padding: '8px 16px' }}
              >
                {isConnected ? <CloudOff size={16}/> : <Cloud size={16}/>}
                {isConnected ? 'Отключить' : 'Подключить'}
              </ActionButton>
            </StatusCard>

            {isConnected && (
              <>
                <ActionButton onClick={syncToCloud} disabled={isLoading} $primary>
                  <Upload size={18}/> 
                  {isLoading ? 'Синхронизация...' : 'Загрузить в облако'}
                </ActionButton>
                
                <ActionButton onClick={syncFromCloud} disabled={isLoading}>
                  <Download size={18}/> 
                  {isLoading ? 'Загрузка...' : 'Загрузить из облака'}
                </ActionButton>
              </>
            )}

            <SettingsSection>
              <SettingRow>
                <SettingLabel>Автоматическая синхронизация</SettingLabel>
                <Toggle $active={autoSync} onClick={toggleAutoSync}/>
              </SettingRow>
              <Note style={{ marginTop: '8px' }}>
                При включении данные будут автоматически синхронизироваться при каждом изменении
              </Note>
            </SettingsSection>
          </Body>

          <Footer>
            <Note>
              {isLoading ? 'Работаем…' : (message || 'Ваши данные будут безопасно сохранены в Google Drive')}
            </Note>
            <InlineBtn onClick={onClose}>Закрыть</InlineBtn>
          </Footer>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}
