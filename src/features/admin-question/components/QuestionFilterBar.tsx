import React, { useEffect, useState } from 'react';
import type { QuestionFilterParams } from '../types';
import { Search } from 'lucide-react';
import { adminPartService } from '@/features/admin-part/services/adminPartService';
import type { PartResponse, AbilityResponse } from '@/features/admin-part/types';

interface QuestionFilterBarProps {
  filters: QuestionFilterParams;
  onFilterChange: (newFilters: Partial<QuestionFilterParams>) => void;
  onAddNew: () => void;
}

export const QuestionFilterBar: React.FC<QuestionFilterBarProps> = ({ filters, onFilterChange, onAddNew }) => {
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);

  // Tải danh sách Parts khi component mount
  useEffect(() => {
    adminPartService.getParts().then(res => {
      if (res.success) setParts(res.data);
    }).catch(console.error);
  }, []);

  // Tải danh sách Abilities nếu người dùng chọn 1 Part
  useEffect(() => {
    if (filters.partId) {
      adminPartService.getAbilities(filters.partId).then(res => {
        if (res.success) setAbilities(res.data);
      }).catch(console.error);
    } else {
      setAbilities([]);
      // Xóa abilityId nếu không chọn part
      if (filters.abilityId) {
        onFilterChange({ abilityId: undefined, page: 0 });
      }
    }
  }, [filters.partId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-100 mb-6 gap-4">
      <div className="flex flex-wrap gap-4 w-full md:w-auto flex-1">
        <div className="relative flex-grow min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm theo nội dung..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange({ keyword: e.target.value, page: 0 })}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <select
          className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.partId || ''}
          onChange={(e) => onFilterChange({ partId: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
        >
          <option value="">Tất cả Part</option>
          {parts.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          value={filters.abilityId || ''}
          onChange={(e) => onFilterChange({ abilityId: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
          disabled={!filters.partId || abilities.length === 0}
        >
          <option value="">Tất cả Năng lực</option>
          {abilities.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.difficulty || ''}
          onChange={(e) => onFilterChange({ difficulty: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
        >
          <option value="">Độ khó</option>
          {[1,2,3,4,5].map(lvl => (
            <option key={lvl} value={lvl}>Level {lvl}</option>
          ))}
        </select>
      </div>

      <button
        onClick={onAddNew}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
      >
        + Tạo câu hỏi
      </button>
    </div>
  );
};
