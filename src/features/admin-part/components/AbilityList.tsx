import React from 'react';
import type { AbilityResponse } from '../types';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface AbilityListProps {
  abilities: AbilityResponse[];
  isLoading: boolean;
  selectedPartName?: string;
  onAdd: () => void;
  onEdit: (ability: AbilityResponse) => void;
  onDelete: (id: number, totalQuestions: number) => void;
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
      <div className="ability-list-container" style={{ alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        Vui lòng chọn một Part để xem các năng lực (Abilities)
      </div>
    );
  }

  return (
    <div className="ability-list-container">
      <div className="ability-list-header">
        <div className="ability-list-title-wrapper">
          <h2 className="ability-list-title">Năng lực đánh giá</h2>
          <p className="ability-list-subtitle">Thuộc {selectedPartName}</p>
        </div>
        <button onClick={onAdd} className="btn-primary">
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
                <th style={{ textAlign: 'center' }}>Số câu hỏi</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
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
                      <span className="badge badge-gray">{ability.totalQuestions || 0} câu</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => onEdit(ability)}
                          className="btn-icon primary"
                          title="Sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(ability.id, ability.totalQuestions || 0)}
                          className="btn-icon danger"
                          title="Xóa"
                          disabled={ability.totalQuestions > 0}
                          style={{ opacity: ability.totalQuestions > 0 ? 0.5 : 1, cursor: ability.totalQuestions > 0 ? 'not-allowed' : 'pointer' }}
                        >
                          <Trash2 size={18} />
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
