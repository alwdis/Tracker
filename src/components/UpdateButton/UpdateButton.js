import React from 'react';
import styled from 'styled-components';
import { RefreshCw, Check, AlertTriangle, Download } from 'lucide-react';

const UpdateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;

  &.current {
    background: ${props => props.theme.success};
    color: white;
    
    &:hover {
      background: ${props => props.theme.success};
      opacity: 0.9;
    }
  }

  &.checking {
    background: ${props => props.theme.accent};
    color: white;
    
    &:hover {
      background: ${props => props.theme.accent};
      opacity: 0.9;
    }
  }

  &.available {
    background: ${props => props.theme.warning};
    color: white;
    
    &:hover {
      background: ${props => props.theme.warning};
      opacity: 0.9;
    }
  }

  &.downloading {
    background: ${props => props.theme.accent};
    color: white;
    
    &:hover {
      background: ${props => props.theme.accent};
      opacity: 0.9;
    }
  }

  &.ready {
    background: ${props => props.theme.error};
    color: white;
    
    &:hover {
      background: ${props => props.theme.error};
      opacity: 0.9;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const VersionText = styled.span`
  font-weight: 600;
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0 0 12px 12px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  width: ${props => props.progress || 0}%;
  transition: width 0.3s ease;
`;

export default function UpdateButtonComponent({ 
  currentVersion, 
  updateStatus, 
  downloadProgress, 
  updateInfo, 
  onClick, 
  theme 
}) {
  const getButtonContent = () => {
    switch (updateStatus) {
      case 'checking':
        return {
          text: `v${currentVersion}`,
          icon: <RefreshCw size={16} />,
          className: 'checking',
          spinning: true
        };
      case 'available':
        return {
          text: `v${updateInfo?.version || currentVersion}`,
          icon: <AlertTriangle size={16} />,
          className: 'available',
          spinning: false
        };
      case 'downloading':
        return {
          text: `${downloadProgress || 0}%`,
          icon: <Download size={16} />,
          className: 'downloading',
          spinning: false
        };
      case 'downloaded':
        return {
          text: `v${updateInfo?.version || currentVersion}`,
          icon: <Check size={16} />,
          className: 'ready',
          spinning: false
        };
      case 'not-available':
        return {
          text: `v${currentVersion}`,
          icon: <Check size={16} />,
          className: 'current',
          spinning: false
        };
      default:
        return {
          text: `v${currentVersion}`,
          icon: <RefreshCw size={16} />,
          className: 'current',
          spinning: false
        };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <UpdateButton 
      className={buttonContent.className}
      onClick={onClick}
      disabled={updateStatus === 'checking'}
      title={getTooltipText()}
    >
      <StatusIcon className={buttonContent.spinning ? 'spinning' : ''}>
        {buttonContent.icon}
      </StatusIcon>
      <VersionText>{buttonContent.text}</VersionText>
      {updateStatus === 'downloading' && (
        <ProgressBar>
          <ProgressFill progress={downloadProgress} />
        </ProgressBar>
      )}
    </UpdateButton>
  );

  function getTooltipText() {
    switch (updateStatus) {
      case 'checking':
        return 'Проверка обновлений...';
      case 'available':
        return 'Нажмите для загрузки обновления';
      case 'downloading':
        return `Загрузка обновления... ${downloadProgress || 0}%`;
      case 'downloaded':
        return 'Нажмите для установки обновления';
      case 'not-available':
        return 'У вас установлена последняя версия';
      default:
        return 'Нажмите для проверки обновлений';
    }
  }
}
