import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const FilterLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
`;

const FilterSelect = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px 16px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  option {
    background: #2d2d2d;
    color: white;
  }
`;

const filterOptions = [
  { value: 'all', label: '📁 Все' },
  { value: 'watching', label: '👀 Смотрю' },
  { value: 'planned', label: '📅 Запланировано' },
  { value: 'completed', label: '✅ Просмотрено' },
  { value: 'dropped', label: '❌ Брошено' }
];

function FilterBar({ activeTab, filter, onFilterChange }) {
  return (
    <FilterContainer>
      <FilterLabel>Фильтр:</FilterLabel>
      <FilterSelect
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
      >
        {filterOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>
    </FilterContainer>
  );
}

export default FilterBar;