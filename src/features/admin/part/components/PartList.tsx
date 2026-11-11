import React, { useState, useMemo } from 'react';
import type { PartResponse, AbilityResponse } from '../types';
import { Plus, Edit2, Trash2, Layers, Search } from 'lucide-react';
import { SectionBadge } from './SectionBadge';

interface PartListProps {
  parts: PartResponse[];
  abilitiesMap?: Record<number, AbilityResponse[]>;
  selectedPartId: number | null;
  onSelectPart: (id: number) => void;
  onAddPart: () => void;
  onEditPart: (part: PartResponse) => void;
  onDeletePart: (id: number) => void;
  isLoading: boolean;
}

export const PartList: React.FC<PartListProps> = ({
  parts,
  abilitiesMap = {},
  selectedPartId,
  onSelectPart,
  onAddPart,
  onEditPart,
  onDeletePart,
  isLoading,
}) => {
  const [keyword, setKeyword] = useState<string>('');

  const filteredParts = useMemo(() => {
    if (!keyword.trim()) return parts;
    const lower = keyword.toLowerCase();
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.sections.toLowerCase().includes(lower) ||
        (p.description && p.description.toLowerCase().includes(lower))
    );
  }, [parts, keyword]);

  return (
    <div className="part-panel-card">
      {/* Header của cột Part */}
      <div className="part-panel-header">
        <div className="panel-title-group">
          <div className="panel-icon-badge">
            <Layers size={16} />
          </div>
          <h2 className="panel-title">Danh sách Phần thi</h2>
          <span className="panel-count-pill">{parts.length}</span>
        </div>

        <button
          onClick={onAddPart}
          className="btn-panel-action primary"
          type="button"
          title="Tạo phần thi mới"
        >
          <Plus size={14} />
          <span>Thêm Part</span>
        </button>
      </div>

      {/* Ô tìm kiếm nhanh */}
      <div className="part-panel-search">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên part hoặc kỹ năng..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Danh sách Parts */}
      <div className="part-cards-scroll">
        {isLoading ? (
          <div className="panel-state-message">
            <div className="loading-spinner-sm" />
            <span>Đang tải danh sách phần thi...</span>
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="panel-state-message">
            <span>Không tìm thấy phần thi phù hợp.</span>
          </div>
        ) : (
          <div className="part-items-stack">
            {filteredParts.map((part) => {
              const isSelected = selectedPartId === part.id;
              const abilitiesCount = abilitiesMap[part.id]?.length ?? 0;

              return (
                <div
                  key={part.id}
                  onClick={() => onSelectPart(part.id)}
                  className={`part-card-item ${isSelected ? 'selected' : ''}`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="part-card-top">
                    <div className="part-card-title-group">
                      <h3 className="part-card-title">{part.name}</h3>
                      <div className="part-card-tags">
                        <SectionBadge section={part.sections} />
                        <span className="part-ability-badge">
                          {abilitiesCount} năng lực
                        </span>
                      </div>
                    </div>

                    <div
                      className="part-card-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onEditPart(part)}
                        className="btn-card-action edit"
                        title="Chỉnh sửa phần thi"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePart(part.id)}
                        className="btn-card-action delete"
                        title="Xóa phần thi"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {part.description && (
                    <p className="part-card-desc">{part.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
