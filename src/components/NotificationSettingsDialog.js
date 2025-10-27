import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Settings, Play, Pause, RefreshCw, Volume2, VolumeX, Monitor, Smartphone, Wifi, WifiOff, CheckCircle, AlertCircle, X } from 'lucide-react';
import { notificationService } from '../lib/notificationService';
import { backgroundSyncService } from '../lib/backgroundSyncService';
import { getTheme } from '../themes';

const DialogOverlay = styled(motion.div)`
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
  z-index: 10000;
  padding: 20px;
`;

const Dialog = styled(motion.div)`
  background: ${p => p.theme.background};
  border: 1px solid ${p => p.theme.border};
  border-radius: 24px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const DialogTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  flex: 1;
  color: ${p => p.theme.text};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 12px;
  padding: 8px;
  color: ${p => p.theme.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${p => p.theme.accent};
    color: white;
  }
`;

const SettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${p => p.theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingItem = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${p => p.theme.accent};
    transform: translateY(-1px);
  }
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const SettingTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${p => p.theme.text};
`;

const SettingDescription = styled.span`
  font-size: 14px;
  color: ${p => p.theme.textSecondary};
`;

const ToggleSwitch = styled.button`
  position: relative;
  width: 56px;
  height: 28px;
  background: ${p => p.$active ? p.theme.accent : p.theme.surfaceSecondary};
  border: 1px solid ${p => p.$active ? p.theme.accent : p.theme.border};
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${p => p.$active ? '30px' : '2px'};
    width: 22px;
    height: 22px;
    background: #fff;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Select = styled.select`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 12px;
  padding: 12px 16px;
  color: ${p => p.theme.text};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${p => p.theme.accent};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:hover {
    border-color: ${p => p.theme.accent};
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
    background: ${p => p.theme.surface};
    color: ${p => p.theme.text};
    border: 1px solid ${p => p.theme.border};

    &:hover:not(:disabled) {
      background: ${p => p.theme.background};
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

const StatsSection = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 16px;
  background: ${p => p.theme.background};
  border-radius: 12px;
  border: 1px solid ${p => p.theme.border};
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${p => p.theme.accent};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${p => p.theme.textSecondary};
  font-weight: 500;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${p => p.$active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${p => p.$active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${p => p.$active ? p.theme.success : p.theme.error};
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$active ? p.theme.success : p.theme.error};
  animation: ${p => p.$active ? 'pulse 2s infinite' : 'none'};
`;

const Message = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;

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
  margin-top: 24px;
`;

const NotificationSettingsDialog = ({ isOpen, onClose, currentTheme, mediaItems }) => {
  const [settings, setSettings] = useState(notificationService.notificationSettings);
  const [isChecking, setIsChecking] = useState(false);
  const [stats, setStats] = useState(notificationService.getStats());
  const [permissionStatus, setPermissionStatus] = useState(notificationService.getPermissionStatus());
  const [backgroundStats, setBackgroundStats] = useState(backgroundSyncService.getStats());

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.notificationSettings);
      setStats(notificationService.getStats());
      setPermissionStatus(notificationService.getPermissionStatus());
      setBackgroundStats(backgroundSyncService.getStats());
    }
  }, [isOpen]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings, mediaItems);
    setStats(notificationService.getStats());
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      await notificationService.manualCheck(mediaItems);
    } catch (error) {
      console.error('Manual check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    return granted;
  };

  const formatInterval = (ms) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    return `${hours} ч`;
  };

  const intervalOptions = [
    { value: 15 * 60 * 1000, label: '15 минут' },
    { value: 30 * 60 * 1000, label: '30 минут' },
    { value: 60 * 60 * 1000, label: '1 час' },
    { value: 2 * 60 * 60 * 1000, label: '2 часа' },
    { value: 6 * 60 * 60 * 1000, label: '6 часов' },
    { value: 12 * 60 * 60 * 1000, label: '12 часов' },
    { value: 24 * 60 * 60 * 1000, label: '24 часа' }
  ];

  if (!isOpen) return null;

  return (
    <ThemeProvider theme={getTheme(currentTheme)}>
      <DialogOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <Dialog
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          theme={getTheme(currentTheme)}
        >
        <DialogHeader>
          <DialogTitle>
            🔔 Уведомления о новых эпизодах
          </DialogTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </DialogHeader>

        <SettingsSection>
          <SectionTitle>
            <Settings size={16} />
            Основные настройки
          </SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Включить уведомления</SettingTitle>
              <SettingDescription>Получать уведомления о новых эпизодах и главах</SettingDescription>
            </SettingLabel>
            <ToggleSwitch
              $active={settings.enabled}
              onClick={() => handleSettingChange('enabled', !settings.enabled)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Интервал проверки</SettingTitle>
              <SettingDescription>Как часто проверять обновления</SettingDescription>
            </SettingLabel>
            <Select
              value={settings.checkInterval}
              onChange={(e) => handleSettingChange('checkInterval', parseInt(e.target.value))}
            >
              {intervalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Только просматриваемые</SettingTitle>
              <SettingDescription>Уведомления только для статуса "Смотрю"</SettingDescription>
            </SettingLabel>
            <ToggleSwitch
              $active={settings.onlyWatching}
              onClick={() => handleSettingChange('onlyWatching', !settings.onlyWatching)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>
            <Monitor size={16} />
            Типы контента
          </SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Аниме</SettingTitle>
              <SettingDescription>Уведомления о новых сериях аниме</SettingDescription>
            </SettingLabel>
            <ToggleSwitch
              $active={settings.animeEnabled}
              onClick={() => handleSettingChange('animeEnabled', !settings.animeEnabled)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Манга</SettingTitle>
              <SettingDescription>Уведомления о новых главах манги</SettingDescription>
            </SettingLabel>
            <ToggleSwitch
              $active={settings.mangaEnabled}
              onClick={() => handleSettingChange('mangaEnabled', !settings.mangaEnabled)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>
            <Smartphone size={16} />
            Способы уведомлений
          </SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Системные уведомления</SettingTitle>
              <SettingDescription>Показывать уведомления в системе</SettingDescription>
            </SettingLabel>
            <ToggleSwitch
              $active={settings.desktopEnabled}
              onClick={() => handleSettingChange('desktopEnabled', !settings.desktopEnabled)}
            />
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              <SettingTitle>Звуковые уведомления</SettingTitle>
              <SettingDescription>Воспроизводить звук при уведомлении</SettingDescription>
            </SettingLabel>
            <ToggleSwitch
              $active={settings.soundEnabled}
              onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
            />
          </SettingItem>
        </SettingsSection>

        <ButtonGroup>
          <ActionButton
            className="primary"
            onClick={handleManualCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Проверка...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Проверить сейчас
              </>
            )}
          </ActionButton>

          {permissionStatus === 'default' && (
            <ActionButton className="secondary" onClick={handleRequestPermission}>
              <Bell size={18} />
              Разрешить уведомления
            </ActionButton>
          )}
        </ButtonGroup>

        <StatsSection>
          <SectionTitle>Статистика</SectionTitle>
          <StatsGrid>
            <StatItem>
              <StatValue>{stats.isRunning ? 'Активен' : 'Остановлен'}</StatValue>
              <StatLabel>Статус сервиса</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{formatInterval(stats.checkInterval)}</StatValue>
              <StatLabel>Интервал проверки</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.lastCheckCount}</StatValue>
              <StatLabel>Отслеживаемых тайтлов</StatLabel>
            </StatItem>
            <StatItem>
              <StatusIndicator $active={permissionStatus === 'granted'}>
                <StatusDot $active={permissionStatus === 'granted'} />
                {permissionStatus === 'granted' ? 'Разрешено' : 'Запрещено'}
              </StatusIndicator>
            </StatItem>
          </StatsGrid>
        </StatsSection>

        <StatsSection>
          <SectionTitle>
            <Wifi size={16} />
            Фоновая синхронизация
          </SectionTitle>
          <StatsGrid>
            <StatItem>
              <StatValue>{backgroundStats.isRunning ? 'Активна' : 'Остановлена'}</StatValue>
              <StatLabel>Статус синхронизации</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{formatInterval(backgroundStats.syncInterval)}</StatValue>
              <StatLabel>Интервал синхронизации</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{backgroundStats.lastSyncTime ? new Date(backgroundStats.lastSyncTime).toLocaleTimeString() : 'Никогда'}</StatValue>
              <StatLabel>Последняя синхронизация</StatLabel>
            </StatItem>
            <StatItem>
              <StatusIndicator $active={backgroundStats.isOnline}>
                <StatusDot $active={backgroundStats.isOnline} />
                {backgroundStats.isOnline ? 'Онлайн' : 'Офлайн'}
              </StatusIndicator>
            </StatItem>
          </StatsGrid>
        </StatsSection>
        </Dialog>
      </DialogOverlay>
    </ThemeProvider>
  );
};

export default NotificationSettingsDialog;
