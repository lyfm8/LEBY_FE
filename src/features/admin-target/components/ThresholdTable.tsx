import React, { useState } from 'react';
import type { ThresholdMatrixResponse } from '../types';
import { Save } from 'lucide-react';

interface ThresholdTableProps {
  matrix: ThresholdMatrixResponse;
  onUpdateThreshold: (moduleId: number, profileId: number, newThreshold: number) => void;
  isUpdating: boolean;
}

export const ThresholdTable: React.FC<ThresholdTableProps> = ({ matrix, onUpdateThreshold, isUpdating }) => {
  // Quản lý trạng thái edit inline
  const [editingCell, setEditingCell] = useState<{ moduleId: number; profileId: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEdit = (moduleId: number, profileId: number, currentVal: number) => {
    setEditingCell({ moduleId, profileId });
    setEditValue(currentVal?.toString() || '0');
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const handleSave = (moduleId: number, profileId: number) => {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onUpdateThreshold(moduleId, profileId, val);
      setEditingCell(null);
    } else {
      alert('Vui lòng nhập phần trăm từ 0 - 100');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, moduleId: number, profileId: number) => {
    if (e.key === 'Enter') {
      handleSave(moduleId, profileId);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col max-h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-gray-800">Ma trận Ngưỡng Pass Module (% đúng)</h3>
        <span className="text-xs text-gray-500">Click vào ô để chỉnh sửa</span>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-100 sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200 border-r w-1/4">Module</th>
              {matrix.profileNames.map((name, index) => (
                <th key={matrix.profileIds[index]} className="px-4 py-3 font-semibold text-center text-blue-800 border-b border-gray-200 min-w-[100px]">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.length === 0 ? (
              <tr>
                <td colSpan={matrix.profileIds.length + 1} className="text-center py-10 text-gray-500">
                  Chưa có dữ liệu Module hoặc Target Profile
                </td>
              </tr>
            ) : (
              matrix.rows.map(row => (
                <tr key={row.moduleId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 border-r border-gray-100 truncate max-w-[250px]" title={row.moduleTitle}>
                    {row.moduleTitle}
                  </td>
                  
                  {matrix.profileIds.map((profileId) => {
                    const thresholdVal = row.thresholds[profileId.toString()] || 0;
                    const isEditing = editingCell?.moduleId === row.moduleId && editingCell?.profileId === profileId;
                    
                    return (
                      <td 
                        key={profileId} 
                        className="px-2 py-2 text-center"
                        onDoubleClick={() => !isUpdating && startEdit(row.moduleId, profileId, thresholdVal)}
                      >
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              autoFocus
                              type="number"
                              min={0}
                              max={100}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, row.moduleId, profileId)}
                              onBlur={() => cancelEdit()}
                              className="w-16 px-2 py-1 text-center border border-blue-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {/* Nút lưu ẩn đi, chủ yếu dùng enter, nhưng để đây lỡ user cần bấm */}
                            <button onMouseDown={(e) => { e.preventDefault(); handleSave(row.moduleId, profileId); }} className="text-green-600">
                              <Save size={16} />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={`cursor-pointer w-full h-full p-2 rounded transition-colors ${isUpdating ? 'opacity-50' : 'hover:bg-blue-100'} ${thresholdVal >= 80 ? 'text-green-700 font-semibold' : thresholdVal >= 50 ? 'text-orange-600 font-medium' : 'text-gray-600'}`}
                            onClick={() => !isUpdating && startEdit(row.moduleId, profileId, thresholdVal)}
                            title="Click để sửa"
                          >
                            {thresholdVal}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
