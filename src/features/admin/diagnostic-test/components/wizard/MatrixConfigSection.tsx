import React, { useMemo } from 'react';
import { Headphones, BookOpen, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ExamMatrixAvailability, ExamQuestionItem, ExamType } from '../../types';
import {
  DEFAULT_MIN_EVIDENCE_COUNT,
  ETS_MOCK_TEST_MATRIX,
  PART_7_BREAKDOWN,
  buildDiagnosticMatrixSummary,
  type PartMatrixConfig,
} from '../../utils/matrixConstants';

interface MatrixConfigSectionProps {
  testType: ExamType;
  targetTotal: number;
  selectedQuestions: ExamQuestionItem[];
  availability: ExamMatrixAvailability | null;
  onAutoSelect: () => void;
  isAutoSelecting: boolean;
}

/**
 * Giao diện Bước 2 - Phương thức B: Tự động theo ma trận phân bổ.
 * Tự động điều chỉnh cấu trúc ma trận theo Đề thi thử 200 câu (ETS) hoặc Đề thi chẩn đoán (theo Quy tắc Đánh giá Năng lực).
 */
export const MatrixConfigSection: React.FC<MatrixConfigSectionProps> = ({
  testType,
  targetTotal,
  selectedQuestions,
  availability,
  onAutoSelect,
  isAutoSelecting,
}) => {
  const isMockTest = testType === 'FULL_MOCK_TEST';
  const listeningParts = ETS_MOCK_TEST_MATRIX.filter((m) => m.section === 'LISTENING');
  const readingParts = ETS_MOCK_TEST_MATRIX.filter((m) => m.section === 'READING');

  const partAvailableCounts = availability?.partAvailableCounts || {};
  const abilities = availability?.abilities || [];
  const diagnosticSummary = !isMockTest ? buildDiagnosticMatrixSummary(abilities, targetTotal) : null;

  const { selectedCountByPart, selectedCountByAbilityName } = useMemo(() => {
    const byPart: Record<number, number> = {};
    const byAbility: Record<string, number> = {};

    for (const q of selectedQuestions) {
      const partNo = q.partNumber || 1;
      byPart[partNo] = (byPart[partNo] || 0) + 1;

      if (q.abilityNames) {
        for (const abName of q.abilityNames) {
          const normalized = abName.trim().toLowerCase();
          if (normalized) {
            byAbility[normalized] = (byAbility[normalized] || 0) + 1;
          }
        }
      }
    }

    return { selectedCountByPart: byPart, selectedCountByAbilityName: byAbility };
  }, [selectedQuestions]);

  const getRequiredCount = (part: PartMatrixConfig): number =>
    isMockTest ? part.standardCount : (diagnosticSummary?.partCounts[part.partNumber] ?? part.standardCount);

  const listeningTotal = listeningParts.reduce((sum, part) => sum + getRequiredCount(part), 0);
  const readingTotal = readingParts.reduce((sum, part) => sum + getRequiredCount(part), 0);

  // Tìm các Part bị thiếu câu hỏi trong ngân hàng
  const missingParts: { partNo: number; required: number; available: number }[] = [];
  for (const part of ETS_MOCK_TEST_MATRIX) {
    const req = getRequiredCount(part);
    const avail = partAvailableCounts[part.partNumber] || 0;
    if (avail < req) {
      missingParts.push({ partNo: part.partNumber, required: req, available: avail });
    }
  }

  // Tìm các Ability chưa đủ số câu tối thiểu (chỉ áp dụng cho Đề chẩn đoán)
  const missingAbilities = !isMockTest
    ? abilities.filter((ab) => {
        const minReq =
          ab.minEvidenceCount && ab.minEvidenceCount > 0 ? ab.minEvidenceCount : DEFAULT_MIN_EVIDENCE_COUNT;
        return ab.availableQuestionCount < minReq;
      })
    : [];

  const renderSelectionStatusBadge = (selectedCount: number, requiredCount: number) => {
    if (selectedCount >= requiredCount) {
      return (
        <span style={{ fontSize: '11px', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
          Đã chọn đủ
        </span>
      );
    }
    return (
      <span style={{ fontSize: '11px', color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
        Chưa chọn đủ
      </span>
    );
  };

  const renderSectionCard = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    parts: PartMatrixConfig[],
    sectionTotal: number,
    totalLabel: string,
    includePart7Breakdown: boolean
  ) => (
    <div className="matrix-section-card" style={{ margin: 0 }}>
      <div className="matrix-header">
        <div className="matrix-section-title">
          {icon}
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>{subtitle}</div>
          </div>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#F45B0B', backgroundColor: '#FFF7ED', padding: '3px 8px', borderRadius: '6px' }}>
          {sectionTotal} câu
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
          {parts.map((p) => {
            const req = getRequiredCount(p);
            const avail = partAvailableCounts[p.partNumber] || 0;
            const selectedCount = selectedCountByPart[p.partNumber] || 0;
            const isBankEnough = avail >= req;

            return (
              <tr key={p.partNumber}>
                <td>
                  <div style={{ fontWeight: 600, color: '#1E293B' }}>{p.partName}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{p.questionTypeName}</div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{req}</td>
                <td style={{ textAlign: 'center', color: isBankEnough ? '#1E293B' : '#D97706', fontWeight: 600 }}>
                  {avail}/{req}
                </td>
                <td style={{ textAlign: 'right' }}>{renderSelectionStatusBadge(selectedCount, req)}</td>
              </tr>
            );
          })}

          {includePart7Breakdown && (
            <tr style={{ backgroundColor: '#F8FAFC', fontSize: '12px' }}>
              <td style={{ paddingLeft: '20px', color: '#64748B' }}>
                ↳ Single Passages ({PART_7_BREAKDOWN.singlePassages} câu) | Multiple Passages ({PART_7_BREAKDOWN.multiplePassages} câu)
              </td>
              <td style={{ textAlign: 'center' }}>54</td>
              <td style={{ textAlign: 'center' }}>{partAvailableCounts[7] || 0}/54</td>
              <td style={{ textAlign: 'right' }}>
                {renderSelectionStatusBadge(selectedCountByPart[7] || 0, 54)}
              </td>
            </tr>
          )}

          <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}>
            <td>{totalLabel}</td>
            <td style={{ textAlign: 'center' }}>{sectionTotal} câu</td>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header section */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Ma trận phân bổ câu hỏi
        </h3>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          {isMockTest
            ? 'Cấu trúc đề thi thử TOEIC gồm 200 câu theo chuẩn ETS.'
            : `Cấu trúc đề thi chẩn đoán gồm ${targetTotal} câu, bao phủ 7 Part và ${abilities.length} kỹ năng theo Quy tắc Đánh giá Năng lực.`}
        </span>
      </div>

      {/* CẢNH BÁO NẾU TỔNG SỐ CÂU ĐỀ CHẨN ĐOÁN NHỎ HƠN TỔNG SỐ CÂU TỐI THIỂU */}
      {!isMockTest && diagnosticSummary?.isBelowMinimum && (
        <div className="missing-alert-banner" style={{ marginTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Số câu tối thiểu phải &gt;={diagnosticSummary.minRequiredTotal}</strong>
            </span>
          </div>
        </div>
      )}

      {/* 2 BẢNG MA TRẬN SONG SONG (LISTENING & READING) */}
      <div className="matrix-grid-2col">
        {renderSectionCard(
          'Listening',
          'Part 1 – Part 4',
          <Headphones size={18} className="text-orange-500" />,
          listeningParts,
          listeningTotal,
          'Tổng Listening',
          false
        )}

        {renderSectionCard(
          'Reading',
          'Part 5 – Part 7',
          <BookOpen size={18} className="text-orange-500" />,
          readingParts,
          readingTotal,
          'Tổng Reading',
          isMockTest
        )}
      </div>

      {/* BẢNG CHI TIẾT THEO QUY TẮC ĐÁNH GIÁ NĂNG LỰC (CHỈ HIỂN THỊ CHO ĐỀ CHẨN ĐOÁN) */}
      {!isMockTest && abilities.length > 0 && diagnosticSummary && (
        <div className="matrix-section-card" style={{ margin: 0 }}>
          <div className="matrix-header">
            <div className="matrix-section-title">
              <ShieldCheck size={18} className="text-orange-500" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  Phân bổ theo Quy tắc Đánh giá Năng lực
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Mỗi kỹ năng cần đạt tối thiểu số câu theo cấu hình để đánh giá chính xác.
                </div>
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F45B0B', backgroundColor: '#FFF7ED', padding: '3px 8px', borderRadius: '6px' }}>
              Tối thiểu {diagnosticSummary.minRequiredTotal} câu
            </span>
          </div>

          <table className="matrix-table">
            <thead>
              <tr>
                <th>NĂNG LỰC (ABILITY)</th>
                <th style={{ textAlign: 'center' }}>PHẦN THI</th>
                <th style={{ textAlign: 'center' }}>SỐ CÂU TỐI THIỂU</th>
                <th style={{ textAlign: 'center' }}>HIỆN CÓ</th>
                <th style={{ textAlign: 'right' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {abilities.map((ab) => {
                const minReq =
                  ab.minEvidenceCount && ab.minEvidenceCount > 0 ? ab.minEvidenceCount : DEFAULT_MIN_EVIDENCE_COUNT;
                const avail = ab.availableQuestionCount || 0;
                const selectedForAbility = selectedCountByAbilityName[ab.name.trim().toLowerCase()] || 0;
                const isBankEnough = avail >= minReq;

                return (
                  <tr key={ab.id}>
                    <td style={{ fontWeight: 600, color: '#1E293B' }}>{ab.name}</td>
                    <td style={{ textAlign: 'center', color: '#64748B' }}>Part {ab.partNumber ?? '-'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{minReq}</td>
                    <td style={{ textAlign: 'center', color: isBankEnough ? '#1E293B' : '#D97706', fontWeight: 600 }}>
                      {avail}/{minReq}
                    </td>
                    <td style={{ textAlign: 'right' }}>{renderSelectionStatusBadge(selectedForAbility, minReq)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* BANNER CẢNH BÁO NẾU NGÂN HÀNG THIẾU CÂU HỎI */}
      {(missingParts.length > 0 || missingAbilities.length > 0) && (
        <div className="missing-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Question Bank chưa đủ câu hỏi</strong>
              {missingParts.length > 0 ? ` cho Part ${missingParts.map((m) => m.partNo).join(', ')}` : ''}
              {missingAbilities.length > 0
                ? `${missingParts.length > 0 ? ' và' : ''} ${missingAbilities.length} kỹ năng (${missingAbilities.map((a) => a.name).slice(0, 3).join(', ')}${missingAbilities.length > 3 ? '...' : ''})`
                : ''}
              : Cần bổ sung thêm trước khi xuất bản.
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
          <span>{isAutoSelecting ? 'Đang bốc câu hỏi...' : 'Tự động chọn câu hỏi'}</span>
        </button>
      </div>
    </div>
  );
};
