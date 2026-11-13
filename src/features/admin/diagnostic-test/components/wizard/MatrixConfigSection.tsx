import React from 'react';
import { Headphones, BookOpen, Edit2, Sparkles, AlertTriangle } from 'lucide-react';
import type { ExamMatrixAvailability } from '../../types';
import { ETS_MOCK_TEST_MATRIX, PART_7_BREAKDOWN } from '../../utils/matrixConstants';

interface MatrixConfigSectionProps {
  isAdmin: boolean;
  availability: ExamMatrixAvailability | null;
  customMatrix: Record<number, number>;
  onEditMatrixClick?: () => void;
  onAutoSelect: () => void;
  isAutoSelecting: boolean;
}

/**
 * Giao diện Bước 2 - Phương thức B: Tự động theo ma trận phân bổ (khớp hoàn toàn Ảnh 4).
 * Phân quyền Admin được sửa ma trận, Teacher chỉ xem Read-only.
 */
export const MatrixConfigSection: React.FC<MatrixConfigSectionProps> = ({
  isAdmin,
  availability,
  customMatrix,
  onEditMatrixClick,
  onAutoSelect,
  isAutoSelecting,
}) => {
  const listeningParts = ETS_MOCK_TEST_MATRIX.filter((m) => m.section === 'LISTENING');
  const readingParts = ETS_MOCK_TEST_MATRIX.filter((m) => m.section === 'READING');

  const partAvailableCounts = availability?.partAvailableCounts || {};

  // Tìm các Part bị thiếu câu hỏi trong ngân hàng
  const missingParts: { partNo: number; required: number; available: number; missing: number }[] = [];
  for (const part of ETS_MOCK_TEST_MATRIX) {
    const req = customMatrix[part.partNumber] ?? part.standardCount;
    const avail = partAvailableCounts[part.partNumber] || 0;
    if (avail < req) {
      missingParts.push({
        partNo: part.partNumber,
        required: req,
        available: avail,
        missing: req - avail,
      });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Ma trận phân bổ câu hỏi
          </h3>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Cấu trúc đề thi thử TOEIC gồm 200 câu theo chuẩn ETS.
          </span>
        </div>

        {/* NÚT CHỈNH SỬA MA TRẬN - CHỈ HIỂN THỊ KHI ROLE LÀ ADMIN */}
        {isAdmin && (
          <button
            type="button"
            className="exam-btn-reset"
            style={{ color: '#F45B0B', borderColor: '#FFEDD5', backgroundColor: '#FFF7ED' }}
            onClick={onEditMatrixClick}
          >
            <Edit2 size={15} />
            <span>Chỉnh sửa ma trận</span>
          </button>
        )}
      </div>

      {/* 2 BẢNG MA TRẬN SONG SONG (LISTENING & READING) */}
      <div className="matrix-grid-2col">
        {/* BẢNG LISTENING */}
        <div className="matrix-section-card" style={{ margin: 0 }}>
          <div className="matrix-header">
            <div className="matrix-section-title">
              <Headphones size={18} className="text-orange-500" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Listening</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Part 1 – Part 4</div>
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F45B0B', backgroundColor: '#FFF7ED', padding: '3px 8px', borderRadius: '6px' }}>
              100 câu
            </span>
          </div>

          <table className="matrix-table">
            <thead>
              <tr>
                <th>PART / DẠNG BÀI</th>
                <th style={{ textAlign: 'center' }}>YÊU CẦU</th>
                <th style={{ textAlign: 'center' }}>HIỆN CÓ</th>
                <th style={{ textAlign: 'right' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {listeningParts.map((p) => {
                const req = customMatrix[p.partNumber] ?? p.standardCount;
                const avail = partAvailableCounts[p.partNumber] || 0;
                const isEnough = avail >= req;

                return (
                  <tr key={p.partNumber}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{p.partName}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{p.questionTypeName}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{req}</td>
                    <td style={{ textAlign: 'center', color: isEnough ? '#1E293B' : '#D97706', fontWeight: 600 }}>
                      {avail}/{req}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isEnough ? (
                        <span style={{ fontSize: '11px', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ Đủ câu hỏi
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Thiếu {req - avail} câu
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}>
                <td>Tổng Listening</td>
                <td style={{ textAlign: 'center' }}>100 câu</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>

        {/* BẢNG READING */}
        <div className="matrix-section-card" style={{ margin: 0 }}>
          <div className="matrix-header">
            <div className="matrix-section-title">
              <BookOpen size={18} className="text-orange-500" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Reading</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Part 5 – Part 7</div>
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F45B0B', backgroundColor: '#FFF7ED', padding: '3px 8px', borderRadius: '6px' }}>
              100 câu
            </span>
          </div>

          <table className="matrix-table">
            <thead>
              <tr>
                <th>PART / DẠNG BÀI</th>
                <th style={{ textAlign: 'center' }}>YÊU CẦU</th>
                <th style={{ textAlign: 'center' }}>HIỆN CÓ</th>
                <th style={{ textAlign: 'right' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {readingParts.map((p) => {
                const req = customMatrix[p.partNumber] ?? p.standardCount;
                const avail = partAvailableCounts[p.partNumber] || 0;
                const isEnough = avail >= req;

                return (
                  <tr key={p.partNumber}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{p.partName}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{p.questionTypeName}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{req}</td>
                    <td style={{ textAlign: 'center', color: isEnough ? '#1E293B' : '#D97706', fontWeight: 600 }}>
                      {avail}/{req}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isEnough ? (
                        <span style={{ fontSize: '11px', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ Đủ câu hỏi
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Thiếu {req - avail} câu
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Sub-breakdown Part 7 */}
              <tr style={{ backgroundColor: '#F8FAFC', fontSize: '12px' }}>
                <td style={{ paddingLeft: '20px', color: '#64748B' }}>
                  ↳ Single Passages ({PART_7_BREAKDOWN.singlePassages} câu) | Multiple Passages ({PART_7_BREAKDOWN.multiplePassages} câu)
                </td>
                <td style={{ textAlign: 'center' }}>54</td>
                <td style={{ textAlign: 'center' }}>{partAvailableCounts[7] || 0}/54</td>
                <td style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#16A34A' }}>✓ Chuẩn ETS</span>
                </td>
              </tr>

              <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}>
                <td>Tổng Reading</td>
                <td style={{ textAlign: 'center' }}>100 câu</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* BANNER CẢNH BÁO NẾU NGÂN HÀNG THIẾU CÂU HỎI */}
      {missingParts.length > 0 && (
        <div className="missing-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Question Bank chưa đủ câu hỏi</strong> cho Part {missingParts.map((m) => m.partNo).join(', ')}: Cần bổ sung thêm trước khi xuất bản.
            </span>
          </div>
          <button
            type="button"
            className="exam-btn-reset"
            style={{ height: '32px', fontSize: '12px', backgroundColor: '#FFFFFF' }}
            onClick={() => window.open('/admin/questions', '_blank')}
          >
            Xem câu hỏi thiếu
          </button>
        </div>
      )}

      {/* NÚT TỰ ĐỘNG CHỌN CÂU HỎI */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button
          type="button"
          className="btn-primary-orange"
          style={{ backgroundColor: '#0F172A' }}
          onClick={onAutoSelect}
          disabled={isAutoSelecting}
        >
          <Sparkles size={16} className="text-amber-400" />
          <span>{isAutoSelecting ? 'Đang bốc câu hỏi...' : '✨ Tự động chọn câu hỏi'}</span>
        </button>
      </div>
    </div>
  );
};
