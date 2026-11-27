import React from 'react';
import { Clock, HelpCircle, Headphones, BookOpen, Edit2, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { ExamQuestionItem, ExamType } from '../../types';
import type { ValidationResult } from '../../utils/checklistValidation';
import { ChecklistCard } from './ChecklistCard';

interface Step3Props {
  testType: ExamType;
  title: string;
  description: string;
  durationMinutes: number;
  selectedQuestions: ExamQuestionItem[];
  validationResult: ValidationResult;
  onEditInfo: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onSaveOfficial: () => void;
  isSaving: boolean;
}

/**
 * Bước 3: Kiểm tra tổng thể và Lưu đề thi (khớp hoàn toàn với bản thảo giao diện demo Ảnh 5).
 * Lưu ý nghiệp vụ: Đổi nút kích hoạt ngay thành "Lưu đề thi" và ở chế độ Archived để Admin active sau.
 */
export const Step3_Review: React.FC<Step3Props> = ({
  testType,
  title,
  description,
  durationMinutes,
  selectedQuestions,
  validationResult,
  onEditInfo,
  onBack,
  onSaveDraft,
  onSaveOfficial,
  isSaving,
}) => {
  // Tính toán số lượng Listening / Reading và phân bổ Part
  let listeningCount = 0;
  let readingCount = 0;
  const partMap: Record<number, number> = {};

  for (const q of selectedQuestions) {
    const part = q.partNumber || 1;
    partMap[part] = (partMap[part] || 0) + 1;
    if (q.section === 'LISTENING' || (part >= 1 && part <= 4)) {
      listeningCount++;
    } else {
      readingCount++;
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
      {/* CỘT TRÁI: TỔNG QUAN VÀ CƠ CẤU ĐỀ THI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Card Tóm tắt đề thi */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span className={testType === 'FULL_MOCK_TEST' ? 'badge-mock' : 'badge-diagnostic'}>
              {testType === 'FULL_MOCK_TEST' ? 'MOCK TEST' : 'DIAGNOSTIC TEST'}
            </span>

            <button
              type="button"
              className="exam-btn-reset"
              style={{ fontSize: '13px', color: '#F45B0B' }}
              onClick={onEditInfo}
            >
              <Edit2 size={14} />
              <span>Chỉnh sửa thông tin</span>
            </button>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>{title}</h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            {description || 'Không có mô tả bổ sung.'}
          </p>

          {/* 4 Stat Pills */}
          <div className="stat-pills-grid">
            <div className="stat-pill">
              <div className="stat-pill-icon">
                <Clock size={18} />
              </div>
              <div className="stat-pill-info">
                <span className="stat-pill-label">Thời gian</span>
                <span className="stat-pill-value">{durationMinutes} phút</span>
              </div>
            </div>

            <div className="stat-pill">
              <div className="stat-pill-icon">
                <HelpCircle size={18} />
              </div>
              <div className="stat-pill-info">
                <span className="stat-pill-label">Tổng số câu</span>
                <span className="stat-pill-value">{selectedQuestions.length} câu</span>
              </div>
            </div>

            <div className="stat-pill">
              <div className="stat-pill-icon">
                <Headphones size={18} />
              </div>
              <div className="stat-pill-info">
                <span className="stat-pill-label">Listening</span>
                <span className="stat-pill-value">{listeningCount} câu</span>
              </div>
            </div>

            <div className="stat-pill">
              <div className="stat-pill-icon">
                <BookOpen size={18} />
              </div>
              <div className="stat-pill-info">
                <span className="stat-pill-label">Reading</span>
                <span className="stat-pill-value">{readingCount} câu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Cơ cấu đề thi */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Cơ cấu đề thi</h3>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Phân bổ câu hỏi theo từng Part.</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '12px' }}>
              <CheckCircle2 size={14} />
              <span>Đúng ma trận</span>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Listening Breakdown */}
            <div style={{ border: '1px solid #F1F5F9', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', marginBottom: '10px', color: '#0F172A' }}>
                <span>🎧 Listening</span>
                <span style={{ color: '#F45B0B' }}>{listeningCount} câu</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Part 1 (Photographs)</span>
                  <span style={{ fontWeight: 600 }}>{partMap[1] || 0} câu</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Part 2 (Question – Response)</span>
                  <span style={{ fontWeight: 600 }}>{partMap[2] || 0} câu</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Part 3 (Conversations)</span>
                  <span style={{ fontWeight: 600 }}>{partMap[3] || 0} câu</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Part 4 (Talks)</span>
                  <span style={{ fontWeight: 600 }}>{partMap[4] || 0} câu</span>
                </div>
              </div>
            </div>

            {/* Reading Breakdown */}
            <div style={{ border: '1px solid #F1F5F9', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', marginBottom: '10px', color: '#0F172A' }}>
                <span>📖 Reading</span>
                <span style={{ color: '#F45B0B' }}>{readingCount} câu</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Part 5 (Incomplete Sentences)</span>
                  <span style={{ fontWeight: 600 }}>{partMap[5] || 0} câu</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Part 6 (Text Completion)</span>
                  <span style={{ fontWeight: 600 }}>{partMap[6] || 0} câu</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Part 7 (Reading Comprehension)</span>
                  <span style={{ fontWeight: 600 }}>{partMap[7] || 0} câu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: CHECKLIST VÀ SẴN SÀNG LƯU ĐỀ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ChecklistCard validationResult={validationResult} />

        {/* Card Sẵn sàng lưu đề thi */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#0F172A', fontWeight: 700, fontSize: '15px' }}>
            <ShieldCheck size={18} className="text-green-600" />
            <span>Sẵn sàng lưu đề thi</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.4 }}>
            Tất cả thông tin và cơ cấu câu hỏi đã hợp lệ. Đề thi sẽ được lưu ở chế độ <strong>Lưu trữ (Archive)</strong> và sẵn sàng để Admin kích hoạt khi cần.
          </p>

          <button
            type="button"
            className="btn-primary-orange"
            style={{ width: '100%', justifyContent: 'center', height: '44px' }}
            disabled={!validationResult.canSaveOfficial || isSaving}
            onClick={onSaveOfficial}
          >
            <CheckCircle2 size={16} />
            <span>{isSaving ? 'Đang lưu đề thi...' : 'Lưu đề thi'}</span>
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="wizard-footer" style={{ gridColumn: '1 / -1' }}>
        <button type="button" className="btn-outline-gray" onClick={onBack}>
          &lt; Quay lại
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="btn-outline-gray" onClick={onSaveDraft}>
            Lưu bản nháp
          </button>
          <button
            type="button"
            className="btn-primary-orange"
            disabled={!validationResult.canSaveOfficial || isSaving}
            onClick={onSaveOfficial}
          >
            <span>{isSaving ? 'Đang xử lý...' : 'Lưu đề thi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

