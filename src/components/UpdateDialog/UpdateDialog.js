import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Download, RefreshCw, Check, AlertTriangle, Clock } from 'lucide-react';

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

const VersionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: ${props => props.theme.surface};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.border};
`;

const VersionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VersionLabel = styled.span`
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
`;

const VersionValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const UpdateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: ${props => props.theme.surface};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.border};
`;

const UpdateTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UpdateDescription = styled.div`
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  line-height: 1.5;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.border};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.progress || 0}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  text-align: center;
  margin-top: 4px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

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

export default function UpdateDialog({ open, onClose, darkMode, currentVersion, updateInfo, updateStatus, downloadProgress, onCheckUpdates, onDownloadUpdate, onInstallUpdate }) {
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('info');

  useEffect(() => { 
    if (open) {
      setMsg(null);
    }
  }, [open]);

  const handleCheckUpdates = async () => {
    setMsg(null);
    try {
      await onCheckUpdates();
    } catch (error) {
      setMsg(`Ошибка проверки обновлений: ${error.message}`);
      setMsgType('error');
    }
  };

  const handleDownloadUpdate = async () => {
    setMsg(null);
    try {
      await onDownloadUpdate();
    } catch (error) {
      setMsg(`Ошибка загрузки обновления: ${error.message}`);
      setMsgType('error');
    }
  };

  const handleInstallUpdate = async () => {
    setMsg(null);
    try {
      await onInstallUpdate();
    } catch (error) {
      setMsg(`Ошибка установки обновления: ${error.message}`);
      setMsgType('error');
    }
  };

  const getStatusMessage = () => {
    switch (updateStatus) {
      case 'checking':
        return { text: 'Проверка обновлений...', type: 'info' };
      case 'available':
        return { text: `Доступно обновление ${updateInfo?.version}`, type: 'warning' };
      case 'downloading':
        return { text: `Загрузка обновления... ${(downloadProgress || 0).toFixed(2).padStart(5, '0')}%`, type: 'info' };
      case 'downloaded':
        return { text: 'Обновление готово к установке', type: 'success' };
      case 'not-available':
        return { text: 'У вас установлена последняя версия', type: 'success' };
      case 'error':
        return { text: 'Ошибка при проверке обновлений', type: 'error' };
      default:
        return { text: 'Нажмите "Проверить обновления"', type: 'info' };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Overlay onClick={onClose}>
        <Dialog onClick={e => e.stopPropagation()}>
          <Header>
            <Title>Обновления приложения</Title>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          <Content>
            <Section>
              <SectionTitle>
                <RefreshCw size={20} />
                Информация о версии
              </SectionTitle>
              <VersionInfo>
                <VersionRow>
                  <VersionLabel>Текущая версия:</VersionLabel>
                  <VersionValue>v{currentVersion}</VersionValue>
                </VersionRow>
                {updateInfo && (
                  <VersionRow>
                    <VersionLabel>Доступная версия:</VersionLabel>
                    <VersionValue>v{updateInfo.version}</VersionValue>
                  </VersionRow>
                )}
              </VersionInfo>
            </Section>

            <Section>
              <SectionTitle>
                <Download size={20} />
                Статус обновлений
              </SectionTitle>
              <UpdateInfo>
                <UpdateTitle>
                  {statusMessage.type === 'success' && <Check size={18} />}
                  {statusMessage.type === 'error' && <AlertTriangle size={18} />}
                  {statusMessage.type === 'info' && <Clock size={18} />}
                  {statusMessage.type === 'warning' && <AlertTriangle size={18} />}
                  {statusMessage.text}
                </UpdateTitle>
                
                {updateInfo && updateStatus === 'available' && (
                  <UpdateDescription>
                    {updateInfo.releaseNotes || 'Доступно новое обновление с улучшениями и исправлениями.'}
                  </UpdateDescription>
                )}

                {updateStatus === 'downloading' && (
                  <>
                    <ProgressBar>
                      <ProgressFill progress={downloadProgress} />
                    </ProgressBar>
                    <ProgressText>{(downloadProgress || 0).toFixed(2).padStart(5, '0')}% загружено</ProgressText>
                  </>
                )}
              </UpdateInfo>
            </Section>

            {msg && (
              <Message $type={msgType}>
                {msgType === 'success' && <Check size={18} />}
                {msgType === 'error' && <AlertTriangle size={18} />}
                {msgType === 'info' && <Clock size={18} />}
                {msg}
              </Message>
            )}
          </Content>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={onClose}>
              Закрыть
            </Button>
            
            {updateStatus === 'not-available' || updateStatus === 'error' ? (
              <Button type="button" className="primary" onClick={handleCheckUpdates}>
                <RefreshCw size={18} />
                Проверить обновления
              </Button>
            ) : updateStatus === 'available' ? (
              <Button type="button" className="primary" onClick={handleDownloadUpdate}>
                <Download size={18} />
                Скачать обновление
              </Button>
            ) : updateStatus === 'downloaded' ? (
              <Button type="button" className="primary" onClick={handleInstallUpdate}>
                <RefreshCw size={18} />
                Установить и перезапустить
              </Button>
            ) : (
              <Button type="button" className="primary" onClick={handleCheckUpdates} disabled={updateStatus === 'checking'}>
                <RefreshCw size={18} />
                Проверить обновления
              </Button>
            )}
          </ButtonGroup>

          <Footer>
            <FooterText>
              Обновления загружаются автоматически с GitHub.<br />
              Рекомендуется регулярно проверять наличие обновлений.
            </FooterText>
          </Footer>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}
