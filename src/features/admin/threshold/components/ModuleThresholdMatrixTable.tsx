import React, { useState, useMemo, useEffect } from 'react';
import type { ModuleThresholdMatrixResponse, ModuleThresholdItemDto } from '../types';
import type { PartResponse } from '@/features/admin/part/types';
import { Save, RotateCcw, Search, Filter, AlertCircle } from 'lucide-react';

interface ModuleThresholdMatrixTableProps {
  data: ModuleThresholdMatrixResponse | null;
  parts: PartResponse[];
  selectedPartId?: number;
  onSelectPartId: (partId?: number) => void;
  onSaveBatch: (items: ModuleThresholdItemDto[]) => Promise<void>;
  onResetCell: (moduleId: number, profileId: number) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  onDirtyCountChange?: (count: number) => void;
}

/**
 * Bảng Ma trận cấu hình điểm chuẩn đỗ Module Test theo từng mốc AIM (Target Profile).
 * 
 * Tính năng chính:
 * 1. Hiển thị động các cột AIM (AIM 550, 650, 750, 850, 990...).
 * 2. Phân biệt rõ điểm tùy biến (isCustom = true) và điểm mặc định hệ thống.
 * 3. Chỉnh sửa inline trực tiếp trên từng ô, theo dõi trạng thái thay đổi (dirty cells).
 * 4. Hỗ trợ nút lưu hàng loạt (Save All) và hoàn tác (Discard).
 * 5. Bộ lọc nhanh theo Part và tìm kiếm theo tiêu đề Module.
 */
export const ModuleThresholdMatrixTable: React.FC<ModuleThresholdMatrixTableProps> = ({
  data,
  parts,
  selectedPartId,
  onSelectPartId,
  onSaveBatch,
  onResetCell,
  isLoading,
  isSaving,
  onDirtyCountChange,
}) => {
  // Quản lý các ô đang bị chỉnh sửa chưa lưu: key = `${moduleId}_${profileId}` -> value = passScore
  const [dirtyCells, setDirtyCells] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Thông báo số lượng ô thay đổi ra component cha
  useEffect(() => {
    onDirtyCountChange?.(Object.keys(dirtyCells).length);
  }, [dirtyCells, onDirtyCountChange]);

  // Lọc danh sách rows theo từ khóa tìm kiếm
  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    if (!searchQuery.trim()) return data.rows;
    const query = searchQuery.toLowerCase().trim();
    return data.rows.filter(
      row =>
        row.moduleTitle.toLowerCase().includes(query) ||
        row.moduleSequence.toString().includes(query) ||
        (row.partName && row.partName.toLowerCase().includes(query))
    );
  }, [data?.rows, searchQuery]);

  // Xử lý khi Admin nhập điểm mới vào ô
  const handleCellChange = (moduleId: number, profileId: number, valStr: string) => {
    const key = `${moduleId}_${profileId}`;
    if (valStr === '') {
      // Cho phép xóa giá trị để fallback về điểm mặc định
      setDirtyCells(prev => ({ ...prev, [key]: -1 }));
      return;
    }

    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setDirtyCells(prev => ({ ...prev, [key]: val }));
    }
  };

  // Hủy toàn bộ thay đổi tạm thời
  const handleDiscardChanges = () => {
    setDirtyCells({});
  };

  // Lưu hàng loạt các ô đã thay đổi
  const handleSaveAll = async () => {
    const items: ModuleThresholdItemDto[] = Object.entries(dirtyCells).map(([key, val]) => {
      const [modIdStr, profIdStr] = key.split('_');
      return {
        moduleId: Number(modIdStr),
        targetProfileId: Number(profIdStr),
        passScore: val === -1 ? null : val, // -1 biểu thị xóa bản ghi ghi đè
      };
    });

    if (items.length === 0) return;

    await onSaveBatch(items);
    setDirtyCells({});
  };

  const dirtyCount = Object.keys(dirtyCells).length;

  return (
    <div className="matrix-table-container">
      {/* Thanh công cụ: Bộ lọc Part, Tìm kiếm, và Nút Lưu Thay Đổi */}
      <div className="matrix-toolbar">
        <div className="matrix-filters">
          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <select
              value={selectedPartId ?? ''}
              onChange={e => {
                if (dirtyCount > 0) {
                  const confirmFilter = window.confirm(
                    `Bạn có ${dirtyCount} ô thay đổi chưa lưu trong Ma trận. Thay đổi bộ lọc Part sẽ hủy các thay đổi này. Bạn có chắc không?`
                  );
                  if (!confirmFilter) return;
                  handleDiscardChanges();
                }
                onSelectPartId(e.target.value ? Number(e.target.value) : undefined);
              }}
              className="select-input"
            >
              <option value="">Tất cả các Part (Part 1 - 7)</option>
              {parts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="search-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm Module..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {dirtyCount > 0 && (
          <div className="dirty-actions-bar">
            <div className="dirty-notice">
              <AlertCircle size={16} className="text-amber-500" />
              <span>
                <strong>{dirtyCount}</strong> ô đã thay đổi
              </span>
            </div>
            <button
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="btn-secondary btn-sm"
            >
              <RotateCcw size={14} /> Hoàn tác
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="btn-primary btn-sm"
            >
              <Save size={14} /> {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
            </button>
          </div>
        )}
      </div>

      {/* Bảng Ma trận */}
      <div className="threshold-table-wrapper matrix-scroll-wrapper">
        {isLoading ? (
          <div className="matrix-loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu ma trận điểm đỗ...</p>
          </div>
        ) : !data || filteredRows.length === 0 ? (
          <div className="matrix-empty-state">
            <AlertCircle size={32} className="text-gray-400" />
            <p>Không tìm thấy Module nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          <table className="admin-table matrix-table">
            <thead>
              <tr>
                <th className="sticky-col col-seq">#</th>
                <th className="sticky-col col-title">Module</th>
                <th className="col-part">Part</th>
                <th className="col-default">Mặc định</th>
                {data.profileIds.map((profId, idx) => (
                  <th key={profId} className="col-aim">
                    <div className="aim-header-badge">
                      <span className="aim-name">{data.profileNames[idx] || `AIM ${data.profileScores[idx]}`}</span>
                      <span className="aim-score">Target: {data.profileScores[idx]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(row => (
                <tr key={row.moduleId}>
                  <td className="sticky-col col-seq text-center font-mono text-gray-500">
                    {row.moduleSequence}
                  </td>
                  <td className="sticky-col col-title">
                    <span className="module-title-cell" title={row.moduleTitle}>
                      {row.moduleTitle}
                    </span>
                  </td>
                  <td className="col-part text-sm text-gray-600">
                    {row.partName || '-'}
                  </td>
                  <td className="col-default text-center">
                    <span className="badge badge-default">
                      {row.defaultPassScore} đ
                    </span>
                  </td>
                  {data.profileIds.map(profId => {
                    const profKey = profId.toString();
                    const cellKey = `${row.moduleId}_${profId}`;
                    const isDirty = dirtyCells.hasOwnProperty(cellKey);
                    const originalScore = row.thresholds[profKey] ?? row.defaultPassScore;
                    const isCustom = row.isCustom[profKey] ?? false;

                    const displayValue = isDirty
                      ? dirtyCells[cellKey] === -1
                        ? ''
                        : dirtyCells[cellKey]
                      : originalScore;

                    return (
                      <td
                        key={profId}
                        className={`col-aim matrix-cell ${isCustom ? 'cell-custom' : 'cell-inherited'} ${isDirty ? 'cell-dirty' : ''
                          }`}
                      >
                        <div className="cell-input-wrapper">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={displayValue}
                            onChange={e => handleCellChange(row.moduleId, profId, e.target.value)}
                            className="matrix-cell-input"
                            title={`Mặc định: ${row.defaultPassScore} đ ${isCustom ? '(Đang tùy biến)' : '(Kế thừa)'}`}
                          />
                          {isCustom && !isDirty && (
                            <button
                              type="button"
                              onClick={() => onResetCell(row.moduleId, profId)}
                              className="btn-cell-reset"
                              title="Khôi phục về điểm đỗ mặc định"
                            >
                              <RotateCcw size={10} />
                            </button>
                          )}
                          {isDirty && <span className="dirty-indicator" title="Chưa lưu" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chú thích bảng (Legend) */}
      <div className="matrix-legend">
        <div className="legend-item">
          <span className="legend-color-box cell-inherited" />
          <span>Điểm kế thừa mặc định của Module</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box cell-custom" />
          <span>Điểm tùy biến theo AIM</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box cell-dirty" />
          <span>Ô đang sửa đổi (chưa lưu)</span>
        </div>
      </div>
    </div>
  );
};
