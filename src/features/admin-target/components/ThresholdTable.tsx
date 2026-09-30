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
    <div className="matrix-container">
      <div className="matrix-header">
        <h3>Ma trận Ngưỡng Pass Module (% đúng)</h3>
        <span>Click vào ô để chỉnh sửa</span>
      </div>
      
      <div className="matrix-table-wrapper">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="col-module">Module</th>
              {matrix.profileNames.map((name, index) => (
                <th key={matrix.profileIds[index]} className="col-profile">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.length === 0 ? (
              <tr>
                <td colSpan={matrix.profileIds.length + 1} style={{ textAlign: 'center', padding: '2.5rem 0', color: '#6b7280' }}>
                  Chưa có dữ liệu Module hoặc Target Profile
                </td>
              </tr>
            ) : (
              matrix.rows.map(row => (
                <tr key={row.moduleId}>
                  <td className="cell-module" title={row.moduleTitle}>
                    {row.moduleTitle}
                  </td>
                  
                  {matrix.profileIds.map((profileId) => {
                    const thresholdVal = row.thresholds[profileId.toString()] || 0;
                    const isEditing = editingCell?.moduleId === row.moduleId && editingCell?.profileId === profileId;
                    
                    return (
                      <td key={profileId} className="cell-threshold">
                        {isEditing ? (
                          <div className="threshold-edit">
                            <input
                              autoFocus
                              type="number"
                              min={0}
                              max={100}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, row.moduleId, profileId)}
                              onBlur={() => cancelEdit()}
                            />
                            <button onMouseDown={(e) => { e.preventDefault(); handleSave(row.moduleId, profileId); }}>
                              <Save size={16} />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={`threshold-val ${isUpdating ? 'disabled' : ''} ${thresholdVal >= 80 ? 'high' : thresholdVal >= 50 ? 'mid' : 'low'}`}
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
