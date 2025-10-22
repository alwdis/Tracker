import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Download, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';

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
  width: 400px; max-width: calc(100vw - 24px);
  background: ${p => p.theme.background}; border: 1px solid ${p => p.theme.border};
  border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.35);
`;
const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding: 16px 20px; border-bottom: 1px solid ${p => p.theme.border};
`;
const Title = styled.h3`
  font-size:18px; font-weight:700; color:${p => p.theme.text};
  display: flex; align-items: center; gap: 8px;
`;
const Close = styled.button`
  border:none; background:transparent; color:${p => p.theme.textSecondary}; cursor:pointer; padding:6px; border-radius:8px;
  &:hover{ background:${p => p.theme.surface}; }
`;
const Body = styled.div` padding: 20px; `;
const StatusIcon = styled.div`
  width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: ${p => p.$type === 'success' ? p.theme.success : 
                   p.$type === 'warning' ? p.theme.warning : 
                   p.$type === 'error' ? p.theme.error : p.theme.accent}; 
  color: white; margin: 0 auto 16px;
`;
const StatusText = styled.div`
  text-align: center; margin-bottom: 20px;
  h4 { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: ${p => p.theme.text}; }
  p { margin: 0; font-size: 14px; color: ${p => p.theme.textSecondary}; line-height: 1.5; }
`;
const ProgressBar = styled.div`
  width: 100%; height: 8px; background: ${p => p.theme.surface}; border-radius: 4px; overflow: hidden; margin-bottom: 16px;
`;
const ProgressFill = styled.div`
  height: 100%; background: ${p => p.theme.accent}; border-radius: 4px;
  width: ${p => p.$progress || 0}%; transition: width 0.3s ease;
`;
const ProgressText = styled.div`
  text-align: center; font-size: 12px; color: ${p => p.theme.textSecondary}; margin-bottom: 20px;
`;
const ButtonGroup = styled.div`
  display: flex; gap: 12px; justify-content: center;
`;
const Button = styled.button`
  padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s ease;
  border: 1px solid ${p => p.$primary ? p.theme.accent : p.theme.border};
  background: ${p => p.$primary ? p.theme.accent : p.theme.surface};
  color: ${p => p.$primary ? 'white' : p.theme.text};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    opacity: 0.5; cursor: not-allowed;
    &:hover { transform: none; box-shadow: none; }
  }
`;

export default function UpdateDialog({ open, onClose, darkMode, updateInfo, onInstallUpdate }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('checking'); // checking, available, downloading, ready, error, none

  useEffect(() => {
    if (open && updateInfo) {
      switch (updateInfo.type) {
        case 'update-available':
          setStatus('available');
          setProgress(0);
          break;
        case 'download-progress':
          setStatus('downloading');
          setProgress(updateInfo.percent || 0);
          break;
        case 'update-downloaded':
          setStatus('ready');
          setProgress(100);
          break;
        case 'error':
          setStatus('error');
          setProgress(0);
          break;
        case 'update-not-available':
          setStatus('none');
          setProgress(0);
          break;
        default:
          setStatus('checking');
          setProgress(0);
      }
    }
  }, [open, updateInfo]);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />,
          title: 'Проверка обновлений',
          description: 'Ищем доступные обновления...',
          type: 'info'
        };
      case 'available':
        return {
          icon: <Download size={24} />,
          title: 'Доступно обновление',
          description: `Версия ${updateInfo?.version} готова к загрузке`,
          type: 'success'
        };
      case 'downloading':
        return {
          icon: <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />,
          title: 'Загрузка обновления',
          description: 'Пожалуйста, подождите...',
          type: 'info'
        };
      case 'ready':
        return {
          icon: <CheckCircle size={24} />,
          title: 'Обновление готово',
          description: `Версия ${updateInfo?.version} загружена и готова к установке`,
          type: 'success'
        };
      case 'error':
        return {
          icon: <AlertCircle size={24} />,
          title: 'Ошибка обновления',
          description: updateInfo?.error || 'Произошла ошибка при проверке обновлений',
          type: 'error'
        };
      case 'none':
        return {
          icon: <CheckCircle size={24} />,
          title: 'Обновлений нет',
          description: 'У вас установлена последняя версия приложения',
          type: 'success'
        };
      default:
        return {
          icon: <Info size={24} />,
          title: 'Проверка обновлений',
          description: 'Проверяем наличие обновлений...',
          type: 'info'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleInstall = () => {
    if (onInstallUpdate) {
      onInstallUpdate();
    }
    onClose();
  };

  const handleClose = () => {
    if (status === 'downloading') {
      // Не закрываем во время загрузки
      return;
    }
    onClose();
  };

  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <Overlay $open={open} onMouseDown={handleClose}>
        <Dialog onMouseDown={(e)=>e.stopPropagation()}>
          <Header>
            <Title>
              {statusConfig.icon}
              {statusConfig.title}
            </Title>
            <Close onClick={handleClose} disabled={status === 'downloading'}>
              <X size={18}/>
            </Close>
          </Header>

          <Body>
            <StatusIcon $type={statusConfig.type}>
              {statusConfig.icon}
            </StatusIcon>
            
            <StatusText>
              <h4>{statusConfig.title}</h4>
              <p>{statusConfig.description}</p>
            </StatusText>

            {(status === 'downloading' || status === 'ready') && (
              <>
                <ProgressBar>
                  <ProgressFill $progress={progress} />
                </ProgressBar>
                <ProgressText>{Math.round(progress)}% загружено</ProgressText>
              </>
            )}

            <ButtonGroup>
              {status === 'ready' && (
                <>
                  <Button $primary onClick={handleInstall}>
                    Установить сейчас
                  </Button>
                  <Button onClick={onClose}>
                    Позже
                  </Button>
                </>
              )}
              
              {status === 'available' && (
                <>
                  <Button $primary onClick={() => setStatus('downloading')}>
                    Загрузить
                  </Button>
                  <Button onClick={onClose}>
                    Отмена
                  </Button>
                </>
              )}
              
              {(status === 'none' || status === 'error') && (
                <Button $primary onClick={onClose}>
                  Закрыть
                </Button>
              )}
              
              {status === 'checking' && (
                <Button disabled>
                  Проверка...
                </Button>
              )}
              
              {status === 'downloading' && (
                <Button disabled>
                  Загрузка...
                </Button>
              )}
            </ButtonGroup>
          </Body>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}
