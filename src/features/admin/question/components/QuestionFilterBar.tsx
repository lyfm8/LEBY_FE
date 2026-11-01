import React from 'react';
import type { QuestionFilterParams } from '../types';
import { Search } from 'lucide-react';

interface QuestionFilterBarProps {
  filters: QuestionFilterParams;
  onFilterChange: (newFilters: Partial<QuestionFilterParams>) => void;
  onAddNew: () => void;
}

export const QuestionFilterBar: React.FC<QuestionFilterBarProps> = ({ filters, onFilterChange, onAddNew }) => {
  return (
    <div className="question-filter-bar">
      <div className="filter-grid">
        <div className="filter-search-wrapper">
          <input
            type="text"
            placeholder="Tìm theo tên câu hỏi..."
            className="filter-search-input"
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange({ keyword: e.target.value, page: 0 })}
          />
          <Search className="filter-search-icon" size={18} />
        </div>
        
        <select
          className="filter-select"
          value={filters.section || ''}
          onChange={(e) => onFilterChange({ section: (e.target.value as any) || undefined, page: 0 })}
        >
          <option value="">Tất cả Section</option>
          <option value="LISTENING">Listening</option>
          <option value="READING">Reading</option>
        </select>

        <select
          className="filter-select"
          value={filters.difficulty ?? ''}
          onChange={(e) => onFilterChange({ difficulty: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
        >
          <option value="">Tất cả Độ khó</option>
          <option value="1">Level 1 (Rất dễ)</option>
          <option value="2">Level 2 (Dễ)</option>
          <option value="3">Level 3 (Trung bình)</option>
          <option value="4">Level 4 (Khó)</option>
          <option value="5">Level 5 (Rất khó)</option>
        </select>
      </div>

      <div className="filter-actions">
        <button
          onClick={onAddNew}
          className="btn-primary"
        >
          + Thêm câu hỏi
        </button>
      </div>
    </div>
  );
};
