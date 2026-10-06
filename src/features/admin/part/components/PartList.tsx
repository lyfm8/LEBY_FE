import React from 'react';
import type { PartResponse } from '../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface PartListProps {
  parts: PartResponse[];
  selectedPartId: number | null;
  onSelectPart: (id: number) => void;
  onAddPart: () => void;
  onEditPart: (part: PartResponse) => void;
  onDeletePart: (id: number) => void;
  isLoading: boolean;
}

export const PartList: React.FC<PartListProps> = ({
  parts,
  selectedPartId,
  onSelectPart,
  onAddPart,
  onEditPart,
  onDeletePart,
  isLoading
}) => {
  return (
    <div className="part-list-container">
      <div className="part-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="part-list-title">Danh sách Part</h2>
        <button 
          onClick={onAddPart} 
          className="btn-primary" 
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
          type="button"
        >
          <Plus size={14} /> Thêm Part
        </button>
      </div>
      <div className="part-list-content">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Đang tải...</div>
        ) : parts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Không có Part nào</div>
        ) : (
          parts.map(part => {
            const isSelected = selectedPartId === part.id;
            const isListening = part.sections === 'LISTENING';

            return (
              <div
                key={part.id}
                onClick={() => onSelectPart(part.id)}
                className={`part-item ${isSelected ? 'active' : 'inactive'}`}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <div>
                    <div className="part-item-name">{part.name}</div>
                    <span 
                      style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.25rem',
                        marginTop: '0.25rem',
                        backgroundColor: isListening ? '#dbeafe' : '#fef3c7',
                        color: isListening ? '#1e40af' : '#92400e'
                      }}
                    >
                      {part.sections}
                    </span>
                  </div>
                  <div 
                    className="part-actions" 
                    style={{ display: 'flex', gap: '0.25rem' }} 
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onEditPart(part)}
                      className="btn-icon primary"
                      style={{ padding: '0.25rem' }}
                      title="Sửa Part"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePart(part.id)}
                      className="btn-icon danger"
                      style={{ padding: '0.25rem' }}
                      title="Xóa Part"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {part.description && (
                  <div className="part-item-desc" style={{ marginTop: '0.35rem' }}>
                    {part.description}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
