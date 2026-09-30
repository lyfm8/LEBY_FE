import React from 'react';
import type { UserFilterParams } from '../types';
import { Search } from 'lucide-react';

interface UserFilterBarProps {
  filters: UserFilterParams;
  onFilterChange: (newFilters: Partial<UserFilterParams>) => void;
  onAddNew: () => void;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({ filters, onFilterChange, onAddNew }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-100 mb-6 gap-4">
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange({ keyword: e.target.value, page: 0 })}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <select
          className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.role || ''}
          onChange={(e) => onFilterChange({ role: e.target.value || undefined, page: 0 })}
        >
          <option value="">Tất cả Role</option>
          <option value="STUDENT">Học viên</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>

        <select
          className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <button
        onClick={onAddNew}
        className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
      >
        + Thêm người dùng
      </button>
    </div>
  );
};
