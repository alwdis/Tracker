import React, { useState, useRef, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { User, Download, Upload, Cloud, Sun, Moon, RefreshCw, ChevronDown } from 'lucide-react';

const light = {
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceSecondary: '#f1f5f9',
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
  surfaceSecondary: '#1f2937',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: '#1f2937',
  accent: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

const ProfileContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ProfileButton = styled.button`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  color: ${p => p.theme.text};
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: ${p => p.theme.surfaceSecondary};
    border-color: ${p => p.theme.accent};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ProfileIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${p => p.theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: ${p => p.theme.background};
  border: 1px solid ${p => p.theme.border};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  opacity: ${p => p.$open ? 1 : 0};
  visibility: ${p => p.$open ? 'visible' : 'hidden'};
  transform: ${p => p.$open ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all 0.2s ease;
`;

const MenuItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  color: ${p => p.theme.text};
  cursor: pointer;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${p => p.theme.surface};
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 12px 12px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: none;
    }
  }
`;

const MenuIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$color || p.theme.textSecondary};
`;

const MenuLabel = styled.span`
  flex: 1;
`;

const MenuBadge = styled.span`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${p => p.theme.surface};
  color: ${p => p.theme.textSecondary};
`;

const Divider = styled.div`
  height: 1px;
  background: ${p => p.theme.border};
  margin: 4px 0;
`;

export default function ProfileMenu({ 
  onExport, 
  onImport, 
  onCloudSync, 
  onThemeToggle, 
  onCheckUpdates,
  isDarkTheme,
  isCheckingUpdates = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (action) => {
    setIsOpen(false);
    if (action) {
      action();
    }
  };

  return (
    <ThemeProvider theme={isDarkTheme ? dark : light}>
      <ProfileContainer ref={menuRef}>
        <ProfileButton onClick={() => setIsOpen(!isOpen)}>
          <ProfileIcon>
            <User size={16} />
          </ProfileIcon>
          <span>Профиль</span>
          <ChevronDown size={16} style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} />
        </ProfileButton>

        <DropdownMenu $open={isOpen}>
          <MenuItem onClick={() => handleMenuClick(onCheckUpdates)} disabled={isCheckingUpdates}>
            <MenuIcon $color={isCheckingUpdates ? '#f59e0b' : '#667eea'}>
              <RefreshCw size={16} style={{ 
                animation: isCheckingUpdates ? 'spin 1s linear infinite' : 'none' 
              }} />
            </MenuIcon>
            <MenuLabel>
              {isCheckingUpdates ? 'Проверка обновлений...' : 'Проверить обновления'}
            </MenuLabel>
            {isCheckingUpdates && <MenuBadge>Загрузка</MenuBadge>}
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => handleMenuClick(onExport)}>
            <MenuIcon $color="#10b981">
              <Download size={16} />
            </MenuIcon>
            <MenuLabel>Экспорт данных</MenuLabel>
          </MenuItem>

          <MenuItem onClick={() => handleMenuClick(onImport)}>
            <MenuIcon $color="#f59e0b">
              <Upload size={16} />
            </MenuIcon>
            <MenuLabel>Импорт данных</MenuLabel>
          </MenuItem>

          <MenuItem onClick={() => handleMenuClick(onCloudSync)}>
            <MenuIcon $color="#667eea">
              <Cloud size={16} />
            </MenuIcon>
            <MenuLabel>Облачная синхронизация</MenuLabel>
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => handleMenuClick(onThemeToggle)}>
            <MenuIcon $color="#f59e0b">
              {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            </MenuIcon>
            <MenuLabel>
              {isDarkTheme ? 'Светлая тема' : 'Тёмная тема'}
            </MenuLabel>
          </MenuItem>
        </DropdownMenu>
      </ProfileContainer>
    </ThemeProvider>
  );
}
