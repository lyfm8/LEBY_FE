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

        {/* Datalist hỗ trợ native browser tick marks */}
        <datalist id="threshold-score-ticks">
          <option value="50" label="50đ" />
          <option value="65" label="65đ" />
          <option value="80" label="80đ" />
          <option value="100" label="100đ" />
        </datalist>
        <datalist id="threshold-rate-ticks">
          <option value="50" label="50%" />
          <option value="70" label="70%" />
          <option value="80" label="80%" />
          <option value="100" label="100%" />
        </datalist>

        {/* Matrix Table */}
        <div className="thresholds-table-wrapper">
          <table className="thresholds-table">
            <thead>
              <tr>
                <th style={{ width: '55px', textAlign: 'center' }}>Thứ tự</th>
                <th>Tên Module & Part</th>
                <th style={{ width: '180px' }}>Điểm đỗ bài thi</th>
                <th style={{ width: '180px' }}>Tỷ lệ bài học</th>
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
                    <div className="threshold-inline-control">
                      <div className="threshold-stepper-box">
                        <input
                          type="number"
                          min="50"
                          max="100"
                          value={item.defaultPassScore}
                          onChange={(e) =>
                            handleScoreChange(item.id, Number(e.target.value))
                          }
                          className="threshold-pill-input"
                        />
                        <span className="threshold-pill-unit">đ</span>
                      </div>
                      <div className="compact-slider-container">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          list="threshold-score-ticks"
                          value={item.defaultPassScore}
                          onChange={(e) =>
                            handleScoreChange(item.id, Number(e.target.value))
                          }
                          className="compact-slider"
                          title={`Điểm đỗ: ${item.defaultPassScore}đ`}
                        />
                        {/* Vạch gạch mức trực quan trên thanh trượt */}
                        <div className="slider-tick-notches" aria-hidden="true">
                          <span className="tick-notch" style={{ left: '0%' }} title="50đ" />
                          <span className="tick-notch milestone" style={{ left: '30%' }} title="Chuẩn gợi ý: 65đ" />
                          <span className="tick-notch" style={{ left: '60%' }} title="80đ" />
                          <span className="tick-notch" style={{ left: '100%' }} title="100đ" />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tỷ lệ hoàn thành */}
                  <td>
                    <div className="threshold-inline-control">
                      <div className="threshold-stepper-box">
                        <input
                          type="number"
                          min="50"
                          max="100"
                          value={item.requiredCompletionRate}
                          onChange={(e) =>
                            handleRateChange(item.id, Number(e.target.value))
                          }
                          className="threshold-pill-input"
                        />
                        <span className="threshold-pill-unit">%</span>
                      </div>
                      <div className="compact-slider-container">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          list="threshold-rate-ticks"
                          value={item.requiredCompletionRate}
                          onChange={(e) =>
                            handleRateChange(item.id, Number(e.target.value))
                          }
                          className="compact-slider"
                          title={`Tỷ lệ hoàn thành: ${item.requiredCompletionRate}%`}
                        />
                        {/* Vạch gạch mức trực quan trên thanh trượt */}
                        <div className="slider-tick-notches" aria-hidden="true">
                          <span className="tick-notch" style={{ left: '0%' }} title="50%" />
                          <span className="tick-notch" style={{ left: '40%' }} title="70%" />
                          <span className="tick-notch milestone" style={{ left: '60%' }} title="Chuẩn gợi ý: 80%" />
                          <span className="tick-notch" style={{ left: '100%' }} title="100%" />
                        </div>
                      </div>
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
