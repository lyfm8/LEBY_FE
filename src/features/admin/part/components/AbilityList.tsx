import React from 'react';
import type { AbilityResponse } from '../types';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface AbilityListProps {
  abilities: AbilityResponse[];
  isLoading: boolean;
  selectedPartName?: string;
  onAdd: () => void;
  onEdit: (ability: AbilityResponse) => void;
  onDelete: (id: number) => void;
}

export const AbilityList: React.FC<AbilityListProps> = ({
  abilities,
  isLoading,
  selectedPartName,
  onAdd,
  onEdit,
  onDelete
}) => {
  if (!selectedPartName) {
    return (
      <div className="ability-list-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', padding: '3rem' }}>
        Vui lòng chọn một Part để xem các năng lực (Abilities)
      </div>
    );
  }

  return (
    <div className="ability-list-container">
      <div className="ability-list-header">
        <div className="ability-list-title-wrapper">
          <h2 className="ability-list-title">Năng lực đánh giá</h2>
          <p className="ability-list-subtitle">Thuộc: <strong>{selectedPartName}</strong></p>
        </div>
        <button onClick={onAdd} className="btn-primary" type="button">
          <Plus size={16} /> Thêm năng lực
        </button>
      </div>
      
      <div className="ability-table-wrapper">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>Đang tải...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên năng lực & Mô tả</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Kỹ năng</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {abilities.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    Chưa có năng lực nào cho phần này
                  </td>
                </tr>
              ) : (
                abilities.map((ability) => (
                  <tr key={ability.id}>
                    <td>
                      <div className="ability-name">{ability.name}</div>
                      {ability.description && <div className="ability-desc">{ability.description}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span 
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.25rem',
                          backgroundColor: ability.sections === 'LISTENING' ? '#dbeafe' : '#fef3c7',
                          color: ability.sections === 'LISTENING' ? '#1e40af' : '#92400e'
                        }}
                      >
                        {ability.sections}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => onEdit(ability)}
                          className="btn-icon primary"
                          title="Sửa năng lực"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(ability.id)}
                          className="btn-icon danger"
                          title="Xóa năng lực"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
