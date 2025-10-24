import React, { useMemo, useCallback, Suspense } from 'react';
import styled from 'styled-components';
import { getTheme } from '../themes';
import MediaCard from './MediaCard';

const VirtualizedContainer = styled.div`
  width: 100%;
  max-height: 600px;
  overflow-y: auto;
  border-radius: 16px;
`;

const VirtualizedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  padding: 12px;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 18px;
  }
  
  @media (max-width: 1000px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 800px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const VirtualizedMediaGrid = React.memo(({ 
  items, 
  onUpdate, 
  onDelete, 
  onEdit, 
  currentTheme
}) => {
  if (items.length === 0) {
    return (
      <div style={{
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: getTheme(currentTheme).textTertiary,
        fontSize: '16px'
      }}>
        Нет элементов для отображения
      </div>
    );
  }

  return (
    <VirtualizedContainer>
      <VirtualizedGrid>
        {items.map((item, index) => (
          <Suspense 
            key={item.id} 
            fallback={
              <div style={{
                height: '220px',
                background: getTheme(currentTheme).surfaceSecondary,
                border: `1px solid ${getTheme(currentTheme).border}`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getTheme(currentTheme).textSecondary,
                fontSize: '14px'
              }}>
                Загрузка...
              </div>
            }
          >
            <MediaCard
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
              currentTheme={currentTheme}
            />
          </Suspense>
        ))}
      </VirtualizedGrid>
    </VirtualizedContainer>
  );
});

VirtualizedMediaGrid.displayName = 'VirtualizedMediaGrid';

export default VirtualizedMediaGrid;
