import React, { useState, useMemo } from 'react';
import type { AbilityResponse, PartResponse } from '../types';
import { Edit2, Trash2, Plus, Brain, Search, Info } from 'lucide-react';
import { SectionBadge } from './SectionBadge';

interface AbilityListProps {
  abilities: AbilityResponse[];
  isLoading: boolean;
  selectedPart?: PartResponse | null;
  selectedPartName?: string;
  onAdd: () => void;
  onEdit: (ability: AbilityResponse) => void;
  onDelete: (id: number) => void;
}

export const AbilityList: React.FC<AbilityListProps> = ({
  abilities,
  isLoading,
  selectedPart,
  selectedPartName,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [keyword, setKeyword] = useState<string>('');

  const displayName = selectedPart?.name || selectedPartName;

  const filteredAbilities = useMemo(() => {
    if (!keyword.trim()) return abilities;
    const lower = keyword.toLowerCase();
    return abilities.filter(
      (ab) =>
        ab.name.toLowerCase().includes(lower) ||
        (ab.description && ab.description.toLowerCase().includes(lower))
    );
  }, [abilities, keyword]);

  if (!displayName) {
    return (
      <div className="ability-panel-card empty-selection">
        <div className="empty-panel-body">
          <div className="empty-icon-circle">
            <Info size={28} className="text-orange" />
          </div>
          <h3 className="empty-title">Chưa chọn phần thi</h3>
          <p className="empty-desc">
            Vui lòng bấm chọn một Phần thi ở danh sách bên trái để quản lý các năng lực đánh giá tương ứng.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ability-panel-card">
      {/* Header của cột Ability */}
      <div className="ability-panel-header">
        <div className="panel-title-group">
          <div className="panel-icon-badge ability">
            <Brain size={16} />
          </div>
          <div className="title-context-block">
            <div className="title-row">
              <h2 className="panel-title">Năng lực đánh giá</h2>
              <span className="panel-count-pill">{abilities.length}</span>
            </div>
            <div className="panel-context-crumb">
              <span>Đang cấu hình: </span>
              <strong className="context-part-name">{displayName}</strong>
              {selectedPart && (
                <span className="crumb-badge">
                  <SectionBadge section={selectedPart.sections} />
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="btn-panel-action primary"
          type="button"
          title="Thêm năng lực mới vào phần thi này"
        >
          <Plus size={14} />
          <span>Thêm năng lực</span>
        </button>
      </div>

      {/* Ô tìm kiếm nhanh */}
      <div className="ability-panel-search">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên năng lực hoặc mô tả..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Bảng danh sách Năng lực */}
      <div className="ability-table-scroll">
        {isLoading ? (
          <div className="panel-state-message">
            <div className="loading-spinner-sm" />
            <span>Đang tải năng lực đánh giá...</span>
          </div>
        ) : filteredAbilities.length === 0 ? (
          <div className="panel-empty-card">
            <Brain size={32} className="empty-state-icon" />
            <p className="empty-state-title">
              {keyword.trim()
                ? 'Không tìm thấy năng lực nào khớp từ khóa.'
                : 'Chưa có năng lực nào cho phần thi này.'}
            </p>
            <p className="empty-state-subtitle">
              Bấm nút &quot;Thêm năng lực&quot; ở trên để bắt đầu định nghĩa tiêu chí đánh giá.
            </p>
          </div>
        ) : (
          <div className="ability-table-container">
            <table className="modern-ability-table">
              <thead>
                <tr>
                  <th>Tên năng lực & Mô tả đánh giá</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Kỹ năng</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbilities.map((ability) => (
                  <tr key={ability.id} className="ability-table-row">
                    <td>
                      <div className="ability-row-content">
                        <div className="ability-name-row">
                          <span className="ability-bullet-dot" />
                          <h4 className="ability-title-text">{ability.name}</h4>
                        </div>
                        {ability.description && (
                          <p className="ability-desc-text">{ability.description}</p>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <SectionBadge section={ability.sections} />
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div className="ability-actions-row">
                        <button
                          type="button"
                          onClick={() => onEdit(ability)}
                          className="btn-card-action edit"
                          title="Chỉnh sửa năng lực"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(ability.id)}
                          className="btn-card-action delete"
                          title="Xóa năng lực"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
