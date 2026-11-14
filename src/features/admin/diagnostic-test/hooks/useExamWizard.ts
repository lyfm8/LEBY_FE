import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/core/ui';
import { adminExamService } from '../services/adminExamService';
import { DEFAULT_EXAM_CONFIGS } from '../utils/matrixConstants';
import { validateExamBeforeSave } from '../utils/checklistValidation';
import type { ExamMatrixAvailability, ExamQuestionItem, ExamType } from '../types';

/**
 * Custom hook quản lý toàn bộ quy trình Tạo đề thi mới (Wizard 3 bước).
 * Xử lý: chuyển bước, cấu hình thông tin đề, chọn câu hỏi thủ công / ma trận tự động,
 * tính toán checklist thời gian thực và lưu đề (Draft / Official).
 */
export function useExamWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'ADMIN';

  // Quản lý bước hiện tại
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [testType, setTestType] = useState<ExamType>('FULL_MOCK_TEST');
  const [title, setTitle] = useState<string>(DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.titlePlaceholder);
  const [description, setDescription] = useState<string>(
    DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.descriptionPlaceholder
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.durationMinutes
  );
  const [targetTotalQuestions, setTargetTotalQuestions] = useState<number>(
    DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.totalQuestions
  );

  // Danh sách câu hỏi đã chọn và ma trận phân bổ chuẩn
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

  // Dữ liệu khả dụng từ Question Bank
  const [availability, setAvailability] = useState<ExamMatrixAvailability | null>(null);
  const [isAutoSelecting, setIsAutoSelecting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  /**
   * Tải dữ liệu khả dụng từ Question Bank.
   */
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

  /**
   * Đổi loại đề thi và áp dụng cấu hình mặc định tương ứng.
   */
  const handleTypeChange = useCallback((newType: ExamType) => {
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
  }, []);

  /**
   * Thêm câu hỏi vào danh sách đã chọn.
   */
  const handleAddQuestion = useCallback((question: ExamQuestionItem) => {
    setSelectedQuestions((prev) => [...prev, question]);
  }, []);

  /**
   * Xóa câu hỏi khỏi danh sách đã chọn.
   */
  const handleRemoveQuestion = useCallback((questionId: number) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
  }, []);

  /**
   * Tự động chọn câu hỏi ngẫu nhiên theo ma trận phân bổ.
   */
  const handleAutoSelect = useCallback(async () => {
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
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Không đủ câu hỏi trong ngân hàng để tự động chọn';
      toast.error(errorMsg);
    } finally {
      setIsAutoSelecting(false);
    }
  }, [testType, targetTotalQuestions, customMatrix, toast]);

  /**
   * Kết quả checklist kiểm tra thời gian thực.
   */
  const validationResult = useMemo(
    () =>
      validateExamBeforeSave({
        testType,
        title,
        durationMinutes,
        selectedQuestions,
        allDbAbilities: availability?.abilities || [],
        targetTotalQuestions,
      }),
    [testType, title, durationMinutes, selectedQuestions, availability?.abilities, targetTotalQuestions]
  );

  const isDiagnosticRoute = window.location.pathname.includes('/diagnostic-tests');
  const handleNavigateBack = useCallback(() => {
    navigate(isDiagnosticRoute ? '/admin/diagnostic-tests' : '/admin/exams');
  }, [isDiagnosticRoute, navigate]);

  /**
   * Lưu đề thi dưới dạng Bản nháp (DRAFT).
   */
  const handleSaveDraft = useCallback(async () => {
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
  }, [title, description, testType, durationMinutes, selectedQuestions, toast, handleNavigateBack]);

  /**
   * Lưu đề thi chính thức (ARCHIVE - sẵn sàng để Active sau).
   */
  const handleSaveOfficial = useCallback(async () => {
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
        isDraft: false,
      });

      toast.success('Tạo và lưu đề thi thành công! Đề thi đã ở trạng thái sẵn sàng để kích hoạt.');
      handleNavigateBack();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Không thể tạo đề thi';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  }, [validationResult.canSaveOfficial, title, description, testType, durationMinutes, selectedQuestions, toast, handleNavigateBack]);

  return {
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
  };
}
