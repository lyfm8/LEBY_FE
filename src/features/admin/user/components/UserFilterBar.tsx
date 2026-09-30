import React from 'react';
import type { UserFilterParams } from '../types';
import { Search } from 'lucide-react';

interface UserFilterBarProps {
  filters: UserFilterParams;
  onFilterChange: (newFilters: Partial<UserFilterParams>) => void;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="user-filter-bar">
      <div className="filter-group">
        <div className="filter-search-wrapper">
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            className="filter-search-input"
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange({ keyword: e.target.value, page: 0 })}
          />
          <Search className="filter-search-icon" size={18} />
        </div>
        
        <select
          className="filter-select"
          value={filters.role || ''}
          onChange={(e) => onFilterChange({ role: e.target.value || undefined, page: 0 })}
        >
          <option value="">Tất cả Role</option>
          <option value="STUDENT">Học viên</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>

        <select
          className="filter-select"
          value={filters.isActive !== undefined ? String(filters.isActive) : ''}
          onChange={(e) => {
            const val = e.target.value;
            onFilterChange({ 
              isActive: val === '' ? undefined : val === 'true', 
              page: 0 
            });
          }}
        >
          <option value="">Trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã khóa</option>
        </select>
      </div>
    </div>
  );
};
