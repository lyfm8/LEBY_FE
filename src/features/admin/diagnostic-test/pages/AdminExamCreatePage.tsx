import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useExamWizard } from '../hooks/useExamWizard';
import { WizardStepper } from '../components/wizard/WizardStepper';
import { Step1_ExamInfo } from '../components/wizard/Step1_ExamInfo';
import { Step2_Questions } from '../components/wizard/Step2_Questions';
import { Step3_Review } from '../components/wizard/Step3_Review';
import '../admin-exam.css';

/**
 * Presentational Page Component: Tạo đề thi mới (Wizard 3 bước hoàn chỉnh).
 * Toàn bộ logic (state bước, form info, auto select, checklist validation, lưu đề) được quản lý bởi useExamWizard.
 */
export const AdminExamCreatePage: React.FC = () => {
  const {
    isAdmin,
    currentStep,
    setCurrentStep,
    testType,
    title,
    setTitle,
    description,
    setDescription,
    durationMinutes,
    setDurationMinutes,
    targetTotalQuestions,
    setTargetTotalQuestions,
    selectedQuestions,
    customMatrix,
    availability,
    isAutoSelecting,
    isSaving,
    validationResult,
    handleTypeChange,
    handleAddQuestion,
    handleRemoveQuestion,
    handleAutoSelect,
    handleSaveDraft,
    handleSaveOfficial,
    handleNavigateBack,
  } = useExamWizard();

  return (
    <div className="exam-page-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={handleNavigateBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            fontSize: '13px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={16} />
          <span>Quản lý đề thi</span>
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h1 className="exam-page-title">Tạo đề thi mới</h1>
        <p className="exam-page-subtitle">Thiết lập thông tin, cấu hình câu hỏi và hoàn tất bộ đề.</p>
      </div>

      {/* Stepper 3 bước */}
      <WizardStepper currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* Nội dung từng bước */}
      {currentStep === 1 && (
        <Step1_ExamInfo
          testType={testType}
          title={title}
          description={description}
          durationMinutes={durationMinutes}
          totalQuestions={targetTotalQuestions}
          onTypeChange={handleTypeChange}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onDurationChange={setDurationMinutes}
          onTotalQuestionsChange={setTargetTotalQuestions}
          onCancel={handleNavigateBack}
          onSaveDraft={handleSaveDraft}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <Step2_Questions
          testType={testType}
          isAdmin={isAdmin}
          targetTotalQuestions={targetTotalQuestions}
          selectedQuestions={selectedQuestions}
          availability={availability}
          customMatrix={customMatrix}
          validationResult={validationResult}
          onAddQuestion={handleAddQuestion}
          onRemoveQuestion={handleRemoveQuestion}
          onAutoSelect={handleAutoSelect}
          isAutoSelecting={isAutoSelecting}
          onBack={() => setCurrentStep(1)}
          onSaveDraft={handleSaveDraft}
          onNext={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 3 && (
        <Step3_Review
          testType={testType}
          title={title}
          description={description}
          durationMinutes={durationMinutes}
          selectedQuestions={selectedQuestions}
          validationResult={validationResult}
          onEditInfo={() => setCurrentStep(1)}
          onBack={() => setCurrentStep(2)}
          onSaveDraft={handleSaveDraft}
          onSaveOfficial={handleSaveOfficial}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};
