import React, { useState } from 'react';
import { MousePointerClick, LayoutGrid, UploadCloud } from 'lucide-react';
import type { ExamMatrixAvailability, ExamQuestionItem, ExamType } from '../../types';
import type { ValidationResult } from '../../utils/checklistValidation';
import { ManualPickerSection } from './ManualPickerSection';
import { MatrixConfigSection } from './MatrixConfigSection';
import { ChecklistCard } from './ChecklistCard';

interface Step2Props {
  testType: ExamType;
  isAdmin: boolean;
  targetTotalQuestions: number;
  selectedQuestions: ExamQuestionItem[];
  availability: ExamMatrixAvailability | null;
  customMatrix: Record<number, number>;
  validationResult: ValidationResult;
  onAddQuestion: (q: ExamQuestionItem) => void;
  onRemoveQuestion: (id: number) => void;
  onAutoSelect: () => void;
  isAutoSelecting: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
}

/**
 * Bước 2: Cấu hình và chọn câu hỏi (khớp Ảnh 3 & Ảnh 4).
 */
export const Step2_Questions: React.FC<Step2Props> = ({
  testType,
  isAdmin,
  targetTotalQuestions,
  selectedQuestions,
  availability,
  customMatrix,
  validationResult,
  onAddQuestion,
  onRemoveQuestion,
  onAutoSelect,
  isAutoSelecting,
  onBack,
  onSaveDraft,
  onNext,
}) => {
  const [method, setMethod] = useState<'MANUAL' | 'MATRIX'>('MANUAL');

  const targetTotal = testType === 'FULL_MOCK_TEST' ? 200 : (targetTotalQuestions || 60);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
      {/* CỘT CHÍNH BÊN TRÁI: KHU VỰC CHỌN CÂU HỎI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Segmented Controls chọn phương thức */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
            Phương thức chọn câu hỏi
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
            Chọn thủ công hoặc để hệ thống tự động phân bổ theo ma trận.
          </div>

          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn ${method === 'MANUAL' ? 'active' : ''}`}
              onClick={() => setMethod('MANUAL')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MousePointerClick size={15} />
                <span>Chọn thủ công</span>
              </span>
            </button>

            <button
              type="button"
              className={`segmented-btn ${method === 'MATRIX' ? 'active' : ''}`}
              onClick={() => setMethod('MATRIX')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LayoutGrid size={15} />
                <span>Tự động theo ma trận</span>
              </span>
            </button>

            <button type="button" className="segmented-btn" disabled title="Tính năng sắp ra mắt">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UploadCloud size={15} />
                <span>Nhập từ file (Sắp ra mắt)</span>
              </span>
            </button>
          </div>
        </div>

        {/* Nội dung theo phương thức */}
        {method === 'MANUAL' ? (
          <ManualPickerSection
            selectedQuestions={selectedQuestions}
            targetTotal={targetTotal}
            onAddQuestion={onAddQuestion}
            onRemoveQuestion={onRemoveQuestion}
          />
        ) : (
          <MatrixConfigSection
            isAdmin={isAdmin}
            availability={availability}
            customMatrix={customMatrix}
            onAutoSelect={onAutoSelect}
            isAutoSelecting={isAutoSelecting}
          />
        )}
      </div>

      {/* CỘT PHỤ BÊN PHẢI: CHECKLIST CARD KIỂM TRA TRƯỚC KHI LƯU */}
      <div>
        <ChecklistCard validationResult={validationResult} />
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
            disabled={!validationResult.isAllPassed}
            onClick={onNext}
          >
            <span>Tiếp tục</span>
            <span>&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

