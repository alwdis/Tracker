import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Check } from 'lucide-react';
import { themes, themeCategories, getTheme } from '../themes';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.background === '#000000' || props.theme.background === '#0a0a0a' 
    ? 'rgba(0, 0, 0, 0.9)' 
    : 'rgba(0, 0, 0, 0.7)'};
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled(motion.div)`
  background: ${props => props.theme.surface} !important;
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  border: 2px solid ${props => props.theme.border};
  box-shadow: ${props => props.theme.shadow ? 
    `0 25px 50px ${props.theme.shadow}` : 
    '0 25px 50px rgba(0, 0, 0, 0.3)'};
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  
  /* Добавляем градиентный фон для градиентных тем */
  ${props => props.theme.accentGradient && `
    background: ${props.theme.accentGradient};
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${props.theme.surface};
      border-radius: 22px;
      opacity: 0.95;
      z-index: -1;
    }
  `}
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
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
  background: ${props => props.theme.accentGradient || 
    `linear-gradient(135deg, ${props.theme.accent} 0%, ${props.theme.accent} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  flex: 1;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 12px;
  
  /* Для тем без поддержки background-clip используем обычный цвет */
  @supports not (-webkit-background-clip: text) {
    background: none;
    -webkit-text-fill-color: unset;
    color: ${props => props.theme.accent};
  }
`;

const CloseButton = styled.button`
  background: ${props => props.theme.surfaceSecondary || props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 8px;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.accent};
    color: white;
    transform: scale(1.05);
    box-shadow: 0 4px 12px ${props => props.theme.shadow || 'rgba(0, 0, 0, 0.2)'};
  }
`;

const ContentContainer = styled.div`
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  
  /* Стили для ползунка прокрутки контента */
  &::-webkit-scrollbar {
    width: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 1px;
    margin: 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 1px;
    min-height: 20px;
    
    &:hover {
      background: ${props => props.theme.accent};
    }
  }
  
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
  
  /* Для Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.border} transparent;
`;

const CategorySection = styled.div`
  margin-bottom: 32px;
`;

const CategoryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const ThemeCard = styled(motion.button)`
  background: ${props => props.theme.surface};
  border: 2px solid ${props => props.$selected ? props.theme.accent : props.theme.border};
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: 120px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${props => props.theme.shadow || 'rgba(0, 0, 0, 0.15)'};
    border-color: ${props => props.theme.accent};
    background: ${props => props.theme.cardHover || props.theme.surfaceSecondary || props.theme.surface};
  }

  ${props => props.$selected && `
    box-shadow: 0 0 0 2px ${props.theme.accent}, 0 8px 25px ${props.theme.shadow || 'rgba(0, 0, 0, 0.15)'};
    background: ${props.theme.cardHover || props.theme.surfaceSecondary || props.theme.surface};
  `}
`;

const ThemePreview = styled.div`
  width: 100%;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$gradient || props.$background};
  border: 1px solid ${props => props.$border};
  position: relative;
  overflow: hidden;
`;

const ThemePreviewAccent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: ${props => props.$accentGradient || props.$accent};
`;

const ThemePreviewSurface = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  height: 16px;
  background: ${props => props.$surface};
  border-radius: 4px;
`;

const ThemePreviewText = styled.div`
  position: absolute;
  top: 28px;
  left: 8px;
  right: 8px;
  height: 8px;
  background: ${props => props.$text};
  border-radius: 2px;
`;

const ThemeName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const SelectedIndicator = styled(motion.div)`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${props => props.theme.accent};
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ColorPalette = styled.div`
  display: flex;
  gap: 4px;
  width: 100%;
`;

const ColorSwatch = styled.div`
  flex: 1;
  height: 8px;
  border-radius: 2px;
  background: ${props => props.$color};
`;

const ThemeSelector = ({ isOpen, onClose, currentTheme, onThemeChange, isDarkMode }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  // Синхронизируем selectedTheme с currentTheme при открытии диалога
  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentTheme);
    }
  }, [isOpen, currentTheme]);

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    onThemeChange(themeId);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Используем selectedTheme для стилизации диалога
  // Это обеспечивает правильный фон при выборе новой темы
  const dialogTheme = getTheme(selectedTheme);

  return (
    <ThemeProvider theme={dialogTheme}>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        transition={{ duration: 0.2 }}
      >
        <Dialog
          key={selectedTheme}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Header>
            <Title>
              <Palette size={24} />
              Выбор темы
            </Title>
            <CloseButton onClick={handleClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          <ContentContainer>
            {Object.entries(themeCategories).map(([categoryId, category]) => (
              <CategorySection key={categoryId}>
                <CategoryTitle>{category.name}</CategoryTitle>
                <ThemeGrid>
                  {category.themes.map((themeId, index) => {
                    const theme = getTheme(themeId);
                    const isSelected = selectedTheme === themeId;
                    
                    return (
                      <ThemeCard
                        key={themeId}
                        $selected={isSelected}
                        onClick={() => handleThemeSelect(themeId)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                      >
                        <PreviewContainer>
                          <ThemePreview
                            $background={theme.background}
                            $gradient={theme.accentGradient}
                            $border={theme.border}
                          >
                            <ThemePreviewAccent
                              $accent={theme.accent}
                              $accentGradient={theme.accentGradient}
                            />
                            <ThemePreviewSurface $surface={theme.surface} />
                            <ThemePreviewText $text={theme.text} />
                          </ThemePreview>
                          
                          <ColorPalette>
                            <ColorSwatch $color={theme.accent} />
                            <ColorSwatch $color={theme.success} />
                            <ColorSwatch $color={theme.warning} />
                            <ColorSwatch $color={theme.error} />
                          </ColorPalette>
                        </PreviewContainer>
                        
                        <ThemeName>{theme.name}</ThemeName>
                        
                        <AnimatePresence>
                          {isSelected && (
                            <SelectedIndicator
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check size={14} />
                            </SelectedIndicator>
                          )}
                        </AnimatePresence>
                      </ThemeCard>
                    );
                  })}
                </ThemeGrid>
              </CategorySection>
            ))}
          </ContentContainer>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
};

export default ThemeSelector;
