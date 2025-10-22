import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { X, Star } from 'lucide-react';

// Теми для диалогов
const lightTheme = {
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#334155',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  accent: '#667eea'
};

const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  border: 'rgba(255, 255, 255, 0.1)',
  accent: '#667eea'
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

const CompletionMessage = styled.div`
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.3);
`;

const MessageText = styled.p`
  color: ${props => props.theme.text};
  font-size: 16px;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RatingSection = styled.div`
  text-align: center;
`;

const RatingLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 16px;
  display: block;
`;

const RatingStars = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  margin: 16px 0;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.$filled ? '#ffd700' : props.theme.textSecondary};
  transition: all 0.2s ease;
  padding: 4px;
  
  &:hover {
    color: #ffd700;
    transform: scale(1.2);
  }
`;

const RatingValue = styled.div`
  font-size: 16px;
  color: ${props => props.theme.text};
  margin-bottom: 8px;
  font-weight: 600;
`;

const CommentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const TextArea = styled.textarea`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 16px;
  color: ${props => props.theme.text};
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.accent};
    background: ${props => props.theme.background};
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
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

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  }

  &.secondary {
    background: ${props => props.theme.surface};
    color: ${props => props.theme.text};
    border: 1px solid ${props => props.theme.border};

    &:hover {
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

function RatingDialog({ item, onClose, onSave, isDarkTheme }) {
  const [rating, setRating] = useState(item.rating || 0);
  const [comment, setComment] = useState(item.comment || '');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, rating, comment);
  };

  const handleStarClick = (value) => {
    setRating(value === rating ? 0 : value);
  };

  const handleSkip = () => {
    onSave(item.id, 0, '');
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <StarButton
          key={i}
          type="button"
          $filled={i <= (hoverRating || rating)}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          title={`Оценка ${i}`}
        >
          <Star 
            size={32} 
            fill={i <= (hoverRating || rating) ? 'currentColor' : 'none'} 
          />
        </StarButton>
      );
    }
    return stars;
  };

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <Overlay onClick={onClose}>
        <Dialog onClick={e => e.stopPropagation()}>
          <Header>
            <Title>Поздравляем! 🎉</Title>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          <CompletionMessage>
            <MessageText>
              Вы завершили просмотр <strong>"{item.title}"</strong>!
            </MessageText>
          </CompletionMessage>

          <Form onSubmit={handleSubmit}>
            <RatingSection>
              <RatingLabel>Как вам понравилось?</RatingLabel>
              <RatingStars>
                {renderStars()}
              </RatingStars>
              <RatingValue>
                {rating ? `Оценка: ${rating}/10` : 'Поставить оценку'}
              </RatingValue>
            </RatingSection>

            <CommentSection>
              <Label>Комментарий (опционально)</Label>
              <TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поделитесь своими впечатлениями..."
              />
            </CommentSection>

            <ButtonGroup>
              <Button 
                type="button" 
                className="secondary" 
                onClick={handleSkip}
              >
                Пропустить
              </Button>
              <Button 
                type="submit" 
                className="primary"
                disabled={!rating}
              >
                Сохранить оценку
              </Button>
            </ButtonGroup>
          </Form>
        </Dialog>
      </Overlay>
    </ThemeProvider>
  );
}

export default RatingDialog;