import React from 'react';
import type { PartResponse } from '../types';

interface PartListProps {
  parts: PartResponse[];
  selectedPartId: number | null;
  onSelectPart: (id: number) => void;
  isLoading: boolean;
}

export const PartList: React.FC<PartListProps> = ({ parts, selectedPartId, onSelectPart, isLoading }) => {
  return (
    <div className="part-list-container">
      <div className="part-list-header">
        <h2 className="part-list-title">Danh sách Part</h2>
      </div>
      <div className="part-list-content">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Đang tải...</div>
        ) : parts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Không có Part nào</div>
        ) : (
          parts.map(part => (
            <button
              key={part.id}
              onClick={() => onSelectPart(part.id)}
              className={`part-item ${selectedPartId === part.id ? 'active' : 'inactive'}`}
            >
              <div className="part-item-name">{part.name}</div>
              <div className="part-item-desc">{part.description}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
