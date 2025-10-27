import React from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, Clock, Play, Pause, Calendar } from 'lucide-react';

const StatusCard = styled.div`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  ${props => props.$status === 'ongoing' && `
    border-color: ${props.theme.success};
    background: ${props.theme.success}10;
  `}
  
  ${props => props.$status === 'completed' && `
    border-color: ${props.theme.accent};
    background: ${props.theme.accent}10;
  `}
  
  ${props => props.$status === 'anons' && `
    border-color: ${props.theme.warning};
    background: ${props.theme.warning}10;
  `}
  
  ${props => props.$status === 'released' && `
    border-color: ${props.theme.textSecondary};
    background: ${props.theme.textSecondary}10;
  `}
`;

const StatusIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch(props.$status) {
      case 'ongoing': return props.theme.success;
      case 'completed': return props.theme.accent;
      case 'anons': return props.theme.warning;
      case 'released': return props.theme.textSecondary;
      default: return props.theme.surfaceSecondary;
    }
  }};
  color: white;
`;

const StatusContent = styled.div`
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => props.$status === 'ongoing' && `
    background: ${props.theme.success}20;
    color: ${props.theme.success};
  `}
  
  ${props => props.$status === 'completed' && `
    background: ${props.theme.accent}20;
    color: ${props.theme.accent};
  `}
  
  ${props => props.$status === 'anons' && `
    background: ${props.theme.warning}20;
    color: ${props.theme.warning};
  `}
  
  ${props => props.$status === 'released' && `
    background: ${props.theme.textSecondary}20;
    color: ${props.theme.textSecondary};
  `}
`;

const TitleStatusIndicator = ({ statusInfo, currentTheme }) => {
  if (!statusInfo) return null;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ongoing': return <Play size={20} />;
      case 'completed': return <CheckCircle size={20} />;
      case 'anons': return <Calendar size={20} />;
      case 'released': return <Clock size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'ongoing': return 'Выходит';
      case 'completed': return 'Завершено';
      case 'anons': return 'Анонсировано';
      case 'released': return 'Вышло';
      default: return 'Неизвестно';
    }
  };

  const getStatusDescription = (statusInfo) => {
    if (statusInfo.isOngoing) {
      return `Сейчас выходит • ${statusInfo.episodes || '?'} ${statusInfo.type === 'anime' ? 'серий' : 'глав'}`;
    }
    if (statusInfo.isCompleted) {
      return `Полностью завершено • ${statusInfo.episodes || '?'} ${statusInfo.type === 'anime' ? 'серий' : 'глав'}`;
    }
    if (statusInfo.isAnons) {
      return 'Анонсировано, дата выхода неизвестна';
    }
    if (statusInfo.isReleased) {
      return `Вышло • ${statusInfo.episodes || '?'} ${statusInfo.type === 'anime' ? 'серий' : 'глав'}`;
    }
    return 'Статус неизвестен';
  };

  return (
    <StatusCard $status={statusInfo.status} theme={currentTheme}>
      <StatusIcon $status={statusInfo.status} theme={currentTheme}>
        {getStatusIcon(statusInfo.status)}
      </StatusIcon>
      <StatusContent theme={currentTheme}>
        <h4>{statusInfo.title}</h4>
        <p>{getStatusDescription(statusInfo)}</p>
      </StatusContent>
      <StatusBadge $status={statusInfo.status} theme={currentTheme}>
        {getStatusText(statusInfo.status)}
      </StatusBadge>
    </StatusCard>
  );
};

export default TitleStatusIndicator;

