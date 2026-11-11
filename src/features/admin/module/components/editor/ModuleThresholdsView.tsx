import React, { useState, useEffect } from 'react';
import type { ModuleResponse } from '../../types';
import { adminModuleService } from '../../services/adminModuleService';
import {
  Save,
  CheckCircle2,
  Search,
} from 'lucide-react';

interface ModuleThresholdsViewProps {
  modules: ModuleResponse[];
  onRefresh: () => void;
  onEditModule?: (id: number) => void;
}

interface LocalThresholdItem {
  id: number;
  title: string;
  sequence: number;
  partName: string | null;
  defaultPassScore: number;
  requiredCompletionRate: number;
  isDirty: boolean;
  isSaving: boolean;
  isSavedSuccess: boolean;
}

export const ModuleThresholdsView: React.FC<ModuleThresholdsViewProps> = ({
  modules,
  onRefresh,
  onEditModule,
}) => {
  const [items, setItems] = useState<LocalThresholdItem[]>([]);
  const [keyword, setKeyword] = useState<string>('');

  useEffect(() => {
    setItems(
      modules.map((m) => ({
        id: m.id,
        title: m.title,
        sequence: m.sequence,
        partName: m.partName,
        defaultPassScore: m.defaultPassScore ?? 65,
        requiredCompletionRate: m.requiredCompletionRate ?? 80,
        isDirty: false,
        isSaving: false,
        isSavedSuccess: false,
      }))
    );
  }, [modules]);

  const handleScoreChange = (id: number, val: number) => {
    const clamped = Math.max(50, Math.min(100, val));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              defaultPassScore: clamped,
              isDirty: true,
              isSavedSuccess: false,
            }
          : item
      )
    );
  };

  const handleRateChange = (id: number, val: number) => {
    const clamped = Math.max(50, Math.min(100, val));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              requiredCompletionRate: clamped,
              isDirty: true,
              isSavedSuccess: false,
            }
          : item
      )
    );
  };

  const handleSaveRow = async (id: number) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;

    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isSaving: true } : it))
    );

    try {
      const res = await adminModuleService.updateModuleThresholds(id, {
        defaultPassScore: target.defaultPassScore,
        requiredCompletionRate: target.requiredCompletionRate,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? { ...it, isSaving: false, isDirty: false, isSavedSuccess: true }
              : it
          )
        );
        setTimeout(() => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, isSavedSuccess: false } : it
            )
          );
        }, 3000);
      }
    } catch (error) {
      console.error('Lỗi cập nhật ngưỡng:', error);
      alert('Không thể cập nhật thông số. Vui lòng thử lại!');
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isSaving: false } : it))
      );
    }
  };

  const handleSaveAllDirty = async () => {
    const dirtyItems = items.filter((it) => it.isDirty);
    if (dirtyItems.length === 0) return;

    for (const item of dirtyItems) {
      await handleSaveRow(item.id);
    }
    onRefresh();
  };

  const filteredItems = items.filter(
    (it) =>
      it.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (it.partName && it.partName.toLowerCase().includes(keyword.toLowerCase()))
  );

  const totalDirty = items.filter((it) => it.isDirty).length;

  return (
    <div className="editor-pane-container">
      {/* Header tinh gọn tối đa diện tích làm việc */}
      <div className="editor-pane-header compact-thresholds-header">
        <div className="editor-header-left">
          <h1 className="editor-main-title">
            Bảng Điểm Chuẩn & Tỷ Lệ Hoàn Thành Module
          </h1>
        </div>

        <div className="editor-header-right">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveAllDirty}
            disabled={totalDirty === 0}
          >
            <Save size={15} />
            <span>Lưu tất cả ({totalDirty})</span>
          </button>
        </div>
      </div>

      {/* Body Table */}
      <div className="thresholds-management-body">
        {/* Search bar */}
        <div className="thresholds-filter-bar">
          <div className="search-box">
            <Search size={14} className="icon" />
            <input
              type="text"
              placeholder="Tìm kiếm module để chỉnh thông số..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* Matrix Table */}
        <div className="thresholds-table-wrapper">
          <table className="thresholds-table">
            <thead>
              <tr>
                <th style={{ width: '55px', textAlign: 'center' }}>Thứ tự</th>
                <th>Tên Module & Part</th>
                <th style={{ width: '160px' }}>Điểm đỗ bài thi</th>
                <th style={{ width: '160px' }}>Tỷ lệ bài học</th>
                <th style={{ width: '75px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={item.isDirty ? 'row-dirty' : ''}
                >
                  <td className="font-semibold text-muted" style={{ textAlign: 'center' }}>
                    #{item.sequence}
                  </td>

                  <td>
                    <div className="module-name-cell">
                      {onEditModule ? (
                        <button
                          type="button"
                          className="name text-left hover:underline cursor-pointer"
                          style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit' }}
                          onClick={() => onEditModule(item.id)}
                          title="Bấm để mở chỉnh sửa chi tiết Module"
                        >
                          {item.title}
                        </button>
                      ) : (
                        <span className="name">{item.title}</span>
                      )}
                      {item.partName && (
                        <span className="part-tag">{item.partName}</span>
                      )}
                    </div>
                  </td>

                  {/* Điểm đỗ */}
                  <td>
                    <div className="threshold-combo-cell">
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={item.defaultPassScore}
                        onChange={(e) =>
                          handleScoreChange(item.id, Number(e.target.value))
                        }
                        className="threshold-combo-input"
                      />
                      <span className="threshold-combo-unit">đ</span>
                      <select
                        className="threshold-combo-select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleScoreChange(item.id, Number(e.target.value));
                        }}
                        title="Chọn nhanh mốc điểm chuẩn"
                      >
                        <option value="" disabled>Mốc chuẩn</option>
                        <option value="50">50đ (Cơ bản)</option>
                        <option value="60">60đ</option>
                        <option value="65">65đ (Chuẩn gợi ý)</option>
                        <option value="70">70đ</option>
                        <option value="75">75đ</option>
                        <option value="80">80đ</option>
                        <option value="90">90đ</option>
                        <option value="100">100đ (Tối đa)</option>
                      </select>
                    </div>
                  </td>

                  {/* Tỷ lệ hoàn thành */}
                  <td>
                    <div className="threshold-combo-cell">
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={item.requiredCompletionRate}
                        onChange={(e) =>
                          handleRateChange(item.id, Number(e.target.value))
                        }
                        className="threshold-combo-input"
                      />
                      <span className="threshold-combo-unit">%</span>
                      <select
                        className="threshold-combo-select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleRateChange(item.id, Number(e.target.value));
                        }}
                        title="Chọn nhanh mốc tỷ lệ chuẩn"
                      >
                        <option value="" disabled>Mốc chuẩn</option>
                        <option value="50">50% (Cơ bản)</option>
                        <option value="60">60%</option>
                        <option value="70">70%</option>
                        <option value="75">75%</option>
                        <option value="80">80% (Chuẩn gợi ý)</option>
                        <option value="85">85%</option>
                        <option value="90">90%</option>
                        <option value="100">100% (Tối đa)</option>
                      </select>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    {item.isSavedSuccess ? (
                      <span className="text-green flex items-center justify-center gap-1 text-sm font-medium">
                        <CheckCircle2 size={15} /> Đã lưu
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={`btn-row-save ${item.isDirty ? 'dirty' : ''}`}
                        onClick={() => handleSaveRow(item.id)}
                        disabled={!item.isDirty || item.isSaving}
                      >
                        {item.isSaving ? 'Lưu...' : 'Lưu'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
