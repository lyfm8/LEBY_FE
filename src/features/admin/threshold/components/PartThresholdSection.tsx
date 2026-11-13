import React from 'react';
import type { PartThresholdRow } from '../types';
import { Layers, AlertTriangle, ArrowRight } from 'lucide-react';

interface PartThresholdSectionProps {
  rows: PartThresholdRow[];
  aimScore?: number;
  errors: Record<string, string>;
  onUpdateRow: (partId: number, field: 'passScore' | 'confirmingScore', value: number | null) => void;
}

export const PartThresholdSection: React.FC<PartThresholdSectionProps> = ({
  rows,
  aimScore,
  errors,
  onUpdateRow,
}) => {
  return (
    <div className="threshold-card-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <div className="panel-icon-badge primary">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="panel-title">Ngưỡng Diagnostic Test</h2>
            <p className="panel-subtitle">
              Cấu hình chuỗi ngưỡng: <strong>PASS ➔ CONFIRM ➔ WEAK</strong> theo từng Part —{' '}
              <strong>AIM {aimScore || 650}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="part-rows-list">
        {rows.map((part) => {
          const rowError = errors[`part_${part.partId}`];
          const isInvalid =
            part.confirmingScore !== null &&
            part.passScore !== null &&
            part.confirmingScore >= part.passScore;

          return (
            <div
              key={part.partId}
              className={`part-flow-row ${rowError || isInvalid ? 'has-error' : ''}`}
            >
              {/* 1. Thông tin Part */}
              <div className="part-meta-block">
                <span className="part-tag-badge">P{part.partNo}</span>
                <div className="part-text-wrap">
                  <span className="part-name">{part.partName}</span>
                  <span className="part-section-chip">
                    {part.section === 'LISTENING' ? '🎧 Listening' : '📖 Reading'}
                  </span>
                </div>
              </div>

              {/* 2. Dòng tuần tự: PASS - input - CONFIRM - input - WEAK */}
              <div className="threshold-flow-sequence">
                {/* Mức 1: PASS */}
                <div className="flow-node node-pass">
                  <span className="flow-badge badge-pass" title="Miễn học toàn bộ Part này">
                    PASS
                  </span>
                  <div className="flow-input-wrap">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="--"
                      value={part.passScore !== null && part.passScore !== undefined ? part.passScore : ''}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        if (raw === '') {
                          onUpdateRow(part.partId, 'passScore', null);
                        } else {
                          const val = parseFloat(raw);
                          onUpdateRow(part.partId, 'passScore', isNaN(val) ? null : val);
                        }
                      }}
                      className="flow-number-input"
                    />
                    <span className="unit-symbol">%</span>
                  </div>
                </div>

                <ArrowRight size={14} className="flow-arrow" />

                {/* Mức 2: CONFIRM */}
                <div className="flow-node node-confirm">
                  <span className="flow-badge badge-confirm" title="Soi kỹ từng Ability con">
                    CONFIRM
                  </span>
                  <div className="flow-input-wrap">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="--"
                      value={part.confirmingScore !== null && part.confirmingScore !== undefined ? part.confirmingScore : ''}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        if (raw === '') {
                          onUpdateRow(part.partId, 'confirmingScore', null);
                        } else {
                          const val = parseFloat(raw);
                          onUpdateRow(part.partId, 'confirmingScore', isNaN(val) ? null : val);
                        }
                      }}
                      className="flow-number-input"
                    />
                    <span className="unit-symbol">%</span>
                  </div>
                </div>

                <ArrowRight size={14} className="flow-arrow" />

                {/* Mức 3: WEAK (Khoảng tự động dưới CONFIRM) */}
                <div className="flow-node node-weak">
                  <span className="flow-badge badge-weak" title="Mất gốc: Bốc toàn bộ 100% module của Part">
                    WEAK
                  </span>
                  <div className="flow-result-chip">
                    {part.confirmingScore !== null && part.confirmingScore !== undefined
                      ? `< ${part.confirmingScore}%`
                      : '< --%'}
                  </div>
                </div>
              </div>

              {/* Thông báo lỗi nếu cận chuẩn >= đạt chuẩn */}
              {isInvalid && (
                <div className="row-logic-error">
                  <AlertTriangle size={13} />
                  <span>Cận chuẩn ({part.confirmingScore}%) phải nhỏ hơn Đạt chuẩn ({part.passScore}%)</span>
                </div>
              )}

              {rowError && !isInvalid && (
                <div className="row-logic-error">
                  <AlertTriangle size={13} />
                  <span>{rowError}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chú thích chân trang */}
      <div className="panel-footer-legend">
        <div className="legend-item">
          <span className="legend-bullet green" />
          <span><strong>PASS (≥ Đạt chuẩn):</strong> Miễn học hoàn toàn Part này</span>
        </div>
        <div className="legend-item">
          <span className="legend-bullet amber" />
          <span><strong>CONFIRM (Cận chuẩn ➔ Đạt chuẩn):</strong> Soi kỹ từng Ability con</span>
        </div>
        <div className="legend-item">
          <span className="legend-bullet red" />
          <span><strong>WEAK (&lt; Cận chuẩn):</strong> Mất gốc, bốc 100% module của Part vào lộ trình</span>
        </div>
      </div>
    </div>
  );
};
