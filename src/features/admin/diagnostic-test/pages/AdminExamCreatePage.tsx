import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/core/ui';
import type { ExamMatrixAvailability, ExamQuestionItem, ExamType } from '../types';
import { DEFAULT_EXAM_CONFIGS } from '../utils/matrixConstants';
import { validateExamBeforeSave } from '../utils/checklistValidation';
import { adminExamService } from '../services/adminExamService';
import { WizardStepper } from '../components/wizard/WizardStepper';
import { Step1_ExamInfo } from '../components/wizard/Step1_ExamInfo';
import { Step2_Questions } from '../components/wizard/Step2_Questions';
import { Step3_Review } from '../components/wizard/Step3_Review';
import '../admin-exam.css';

/**
 * Màn hình 2: Tạo đề thi mới (Wizard 3 bước hoàn chỉnh, khớp hoàn toàn với 4 bản thảo demo Ảnh 2, 3, 4, 5).
 */
export const AdminExamCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'ADMIN';

  // Quản lý bước hiện tại
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [testType, setTestType] = useState<ExamType>('FULL_MOCK_TEST');
  const [title, setTitle] = useState(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.titlePlaceholder);
  const [description, setDescription] = useState(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.descriptionPlaceholder);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.durationMinutes);
  const [targetTotalQuestions, setTargetTotalQuestions] = useState<number>(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.totalQuestions);

  // Danh sách câu hỏi đã chọn và ma trận
  const [selectedQuestions, setSelectedQuestions] = useState<ExamQuestionItem[]>([]);
  const [customMatrix] = useState<Record<number, number>>({
    1: 6,
    2: 25,
    3: 39,
    4: 30,
    5: 30,
    6: 16,
    7: 54,
  });

  // Dữ liệu khả dụng từ DB
  const [availability, setAvailability] = useState<ExamMatrixAvailability | null>(null);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Tải dữ liệu khả dụng từ Question Bank
  const fetchAvailability = useCallback(async () => {
    try {
      const res = await adminExamService.getMatrixAvailability();
      if (res.data) {
        setAvailability(res.data);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Khi người dùng thay đổi loại đề thi ở Bước 1
  const handleTypeChange = (newType: ExamType) => {
    setTestType(newType);
    if (newType === 'DIAGNOSTIC') {
      setTitle(DEFAULT_EXAM_CONFIGS.DIAGNOSTIC.titlePlaceholder);
      setDescription(DEFAULT_EXAM_CONFIGS.DIAGNOSTIC.descriptionPlaceholder);
      setDurationMinutes(DEFAULT_EXAM_CONFIGS.DIAGNOSTIC.durationMinutes);
      setTargetTotalQuestions(DEFAULT_EXAM_CONFIGS.DIAGNOSTIC.totalQuestions);
    } else {
      setTitle(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.titlePlaceholder);
      setDescription(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.descriptionPlaceholder);
      setDurationMinutes(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.durationMinutes);
      setTargetTotalQuestions(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.totalQuestions);
    }
  };

  // Thêm câu hỏi vào đề
  const handleAddQuestion = (question: ExamQuestionItem) => {
    setSelectedQuestions((prev) => [...prev, question]);
  };

  // Xóa câu hỏi khỏi đề
  const handleRemoveQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
  };

  // Tự động chọn câu hỏi ngẫu nhiên theo ma trận
  const handleAutoSelect = async () => {
    setIsAutoSelecting(true);
    try {
      const res = await adminExamService.autoSelect({
        testType,
        totalQuestions: testType === 'DIAGNOSTIC' ? targetTotalQuestions : 200,
        customDistribution: testType === 'FULL_MOCK_TEST' ? customMatrix : undefined,
      });

      if (res.data && res.data.questions) {
        setSelectedQuestions(res.data.questions);
        toast.success(`Đã tự động chọn thành công ${res.data.totalSelected} câu hỏi theo đúng ma trận!`);
      }
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Không đủ câu hỏi trong ngân hàng để tự động chọn';
      toast.error(errorMsg);
    } finally {
      setIsAutoSelecting(false);
    }
  };

  // Tính toán kết quả checklist kiểm tra thời gian thực
  const validationResult = validateExamBeforeSave({
    testType,
    title,
    durationMinutes,
    selectedQuestions,
    allDbAbilities: availability?.abilities || [],
    targetTotalQuestions,
  });

  const isDiagnosticRoute = window.location.pathname.includes('/diagnostic-tests');
  const handleNavigateBack = () => navigate(isDiagnosticRoute ? '/admin/diagnostic-tests' : '/admin/exams');

  // Lưu bản nháp (DRAFT)
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.warning('Vui lòng nhập tên bộ đề thi trước khi lưu nháp');
      return;
    }

    setIsSaving(true);
    try {
      await adminExamService.create({
        title: title.trim(),
        description: description.trim(),
        testType,
        durationMinutes,
        questionIds: selectedQuestions.map((q) => q.questionId),
        isDraft: true,
      });

      toast.success('Đã lưu bản nháp đề thi thành công');
      handleNavigateBack();
    } catch {
      toast.error('Lưu bản nháp thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  // Lưu đề thi hoàn tất (ARCHIVE - sẵn sàng để active sau)
  const handleSaveOfficial = async () => {
    if (!validationResult.canSaveOfficial) {
      toast.warning('Vui lòng hoàn tất tất cả các tiêu chuẩn trong checklist trước khi lưu đề thi');
      return;
    }

    setIsSaving(true);
    try {
      await adminExamService.create({
        title: title.trim(),
        description: description.trim(),
        testType,
        durationMinutes,
        questionIds: selectedQuestions.map((q) => q.questionId),
        isDraft: false, // Lưu ở trạng thái ARCHIVE
      });

      toast.success('Tạo và lưu đề thi thành công! Đề thi đã ở trạng thái sẵn sàng để kích hoạt.');
      handleNavigateBack();
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Không thể tạo đề thi';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

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
