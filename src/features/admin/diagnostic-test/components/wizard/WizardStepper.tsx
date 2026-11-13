import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
}

/**
 * Thanh tiến trình Stepper 3 bước hiển thị trên đầu trang Tạo đề thi.
 */
export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="wizard-stepper">
      {/* Bước 1 */}
      <div
        className={`wizard-step-node ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
        onClick={() => onStepClick && onStepClick(1)}
      >
        <div className="wizard-step-circle">
          {currentStep > 1 ? <Check size={16} /> : 1}
        </div>
        <div className="wizard-step-info">
          <span className="wizard-step-sub">Bước 1</span>
          <span className="wizard-step-label">Thông tin đề thi</span>
        </div>
      </div>

      <div className={`wizard-step-divider ${currentStep > 1 ? 'active' : ''}`} />

      {/* Bước 2 */}
      <div
        className={`wizard-step-node ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
        onClick={() => onStepClick && onStepClick(2)}
      >
        <div className="wizard-step-circle">
          {currentStep > 2 ? <Check size={16} /> : 2}
        </div>
        <div className="wizard-step-info">
          <span className="wizard-step-sub">Bước 2</span>
          <span className="wizard-step-label">Cấu hình & câu hỏi</span>
        </div>
      </div>

      <div className={`wizard-step-divider ${currentStep > 2 ? 'active' : ''}`} />

      {/* Bước 3 */}
      <div
        className={`wizard-step-node ${currentStep === 3 ? 'active' : ''}`}
        onClick={() => onStepClick && onStepClick(3)}
      >
        <div className="wizard-step-circle">3</div>
        <div className="wizard-step-info">
          <span className="wizard-step-sub">Bước 3</span>
          <span className="wizard-step-label">Kiểm tra & lưu</span>
        </div>
      </div>
    </div>
  );
};

