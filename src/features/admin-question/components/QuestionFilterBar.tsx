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
          onChange={(e) => onFilterChange({ section: e.target.value || undefined, page: 0 })}
        >
          <option value="">Tất cả Section</option>
          <option value="LISTENING">Listening</option>
          <option value="READING">Reading</option>
        </select>

        <select
          className="filter-select"
          value={filters.difficulty || ''}
          onChange={(e) => onFilterChange({ difficulty: e.target.value || undefined, page: 0 })}
        >
          <option value="">Tất cả Độ khó</option>
          <option value="EASY">Dễ (Easy)</option>
          <option value="MEDIUM">Trung bình (Medium)</option>
          <option value="HARD">Khó (Hard)</option>
          <option value="VERY_HARD">Rất khó (Very Hard)</option>
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
