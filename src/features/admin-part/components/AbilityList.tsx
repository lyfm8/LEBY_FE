import React from 'react';
import type { AbilityResponse } from '../types';
import { Edit2, Trash2, Tag, BookOpen } from 'lucide-react';

interface AbilityListProps {
  abilities: AbilityResponse[];
  onAdd: () => void;
  onEdit: (ability: AbilityResponse) => void;
  onDelete: (id: number, totalQuestions: number) => void;
  isLoading: boolean;
  selectedPartName?: string;
}

/**
 * Component hiển thị danh sách Ability của Part hiện tại (Cột bên phải)
 */
export const AbilityList: React.FC<AbilityListProps> = ({ 
  abilities, onAdd, onEdit, onDelete, isLoading, selectedPartName 
}) => {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Xuất bản</span>;
      case 'DRAFT':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Bản nháp</span>;
      case 'ARCHIVED':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">Lưu trữ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Quản lý Năng lực (Abilities)</h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedPartName ? `Đang xem: ${selectedPartName}` : 'Vui lòng chọn Part bên trái'}
          </p>
        </div>
        {selectedPartName && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            + Thêm Ability
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
        {!selectedPartName ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Tag size={48} className="mb-4 opacity-50" />
            <p>Chọn một Part bên danh sách để xem các năng lực.</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-10 text-gray-500">Đang tải danh sách năng lực...</div>
        ) : abilities.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
            Chưa có năng lực nào cho Part này. Hãy thêm mới!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {abilities.map(ability => (
              <div key={ability.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 text-base">{ability.name}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(ability)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                      title="Sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(ability.id, ability.totalQuestions)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">{ability.description}</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  {getStatusBadge(ability.status)}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <BookOpen size={14} /> {ability.totalQuestions} câu
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
