import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminModuleTestService } from '../services/adminModuleTestService';
import { moduleTestConfigSchema } from '../utils/schema';
import type {
  ModuleTestConfigDetail,
  ModuleTestQuestionItem,
  ModuleTestSelectionMode,
  PracticeQuestionResponse,
} from '../types';
import { useToast } from '@/core/ui';

/**
 * Giới hạn tối đa câu hỏi trong một bài thi vượt ải (khớp Backend @Size(max = 100)).
 */
const MAX_TEST_QUESTIONS = 100;

/**
 * Kiểu lỗi trích xuất an toàn từ Axios error response mà không dùng any.
 */
interface ApiErrorShape {
  code?: string;
  message?: string;
  response?: {
    data?: {
      code?: string;
      message?: string;
      errorCode?: string;
    };
  };
}

/**
 * Trích xuất mã lỗi và thông điệp lỗi thân thiện từ đối tượng ngoại lệ API.
 */
const extractApiError = (err: unknown): { code?: string; message: string } => {
  // Ép kiểu an toàn qua kiểm tra object trước khi đọc thuộc tính
  const typed = err as ApiErrorShape | null;
  // Đọc mã lỗi từ tầng response.data hoặc trực tiếp từ object lỗi
  const code = typed?.response?.data?.code ?? typed?.response?.data?.errorCode ?? typed?.code;
  // Ưu tiên thông điệp nghiệp vụ trả về từ Backend
  const message =
    typed?.response?.data?.message ??
    typed?.message ??
    'Không thể kết nối máy chủ. Dữ liệu bạn nhập vẫn được giữ nguyên, vui lòng thử lại.';
  return { code, message };
};

/**
 * Custom hook quản lý toàn bộ vòng đời cấu hình Bài thi vượt ải cho một mô-đun:
 * tải chi tiết, quản lý form tham số, thêm/gỡ/đổi thứ tự câu hỏi, tự động bốc câu hỏi,
 * xử lý hộp thoại xác nhận câu hỏi lệch năng lực và giữ nguyên dữ liệu khi lỗi mạng.
 *
 * @param moduleId ID của mô-đun đang cấu hình
 * @param onSaved  Callback thông báo cho component cha làm mới danh sách tổng quan sau khi lưu
 */
export const useModuleTestConfig = (moduleId: number, onSaved?: () => void) => {
  // Hook hiển thị thông báo nổi (Toast)
  const toast = useToast();

  // Dữ liệu chi tiết cấu hình bài thi vượt ải tải từ máy chủ
  const [config, setConfig] = useState<ModuleTestConfigDetail | null>(null);
  // Trạng thái đang tải chi tiết cấu hình
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Thông báo lỗi khi tải cấu hình thất bại
  const [loadError, setLoadError] = useState<string | null>(null);

  // Các state biểu mẫu cục bộ (giữ nguyên khi mất kết nối mạng trong lúc lưu)
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [selectionMode, setSelectionMode] = useState<ModuleTestSelectionMode>('MANUAL');
  const [questions, setQuestions] = useState<ModuleTestQuestionItem[]>([]);

  // Thông báo lỗi kiểm tra hợp lệ ngay gần ô nhập liệu
  const [fieldErrors, setFieldErrors] = useState<{
    durationMinutes?: string;
    questionCount?: string;
    questions?: string;
  }>({});

  // Cờ đánh dấu người dùng đã chỉnh sửa form nhưng chưa bấm Lưu
  const [isDirty, setIsDirty] = useState<boolean>(false);
  // Cờ đang gửi yêu cầu lưu cấu hình lên Backend
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // Cờ đang gọi API tự động bốc câu hỏi ngẫu nhiên
  const [isAutoSelecting, setIsAutoSelecting] = useState<boolean>(false);
  // Cờ hiển thị hộp thoại xác nhận khi có câu hỏi ngoài năng lực đào tạo của mô-đun
  const [isMismatchModalOpen, setIsMismatchModalOpen] = useState<boolean>(false);

  /**
   * Đồng bộ dữ liệu từ phản hồi Backend vào state biểu mẫu cục bộ.
   */
  const applyConfigToForm = useCallback((detail: ModuleTestConfigDetail) => {
    // Lưu bản gốc chi tiết từ Backend
    setConfig(detail);
    // Điền thời gian làm bài vào ô nhập
    setDurationMinutes(detail.durationMinutes ?? 25);
    // Điền số lượng câu hỏi mục tiêu vào ô nhập
    setQuestionCount(detail.questionCount ?? 25);
    // Điền trạng thái bật/tắt xáo trộn câu hỏi và đáp án
    setShuffleQuestions(detail.shuffleQuestions ?? true);
    // Điền chế độ chọn câu hỏi (Thủ công / Ngẫu nhiên theo năng lực)
    setSelectionMode(detail.selectionMode ?? 'MANUAL');
    // Nạp danh sách câu hỏi hiện tại trong đề
    setQuestions(detail.questions ?? []);
    // Xóa các lỗi validation cũ và đánh dấu form sạch
    setFieldErrors({});
    setIsDirty(false);
  }, []);

  /**
   * Gọi API tải chi tiết cấu hình bài thi vượt ải của mô-đun hiện tại.
   */
  const fetchConfig = useCallback(async () => {
    // Bật trạng thái loading và xóa lỗi tải cũ
    setIsLoading(true);
    setLoadError(null);
    try {
      // Gọi API lấy chi tiết cấu hình theo moduleId
      const res = await adminModuleTestService.getConfigDetail(moduleId);
      if (res.data) {
        // Nạp dữ liệu vào state biểu mẫu
        applyConfigToForm(res.data);
      }
    } catch {
      // Hiển thị lỗi kèm nút thử lại nếu gọi API thất bại
      setLoadError('Không thể tải cấu hình bài thi vượt ải của mô-đun này. Vui lòng thử lại.');
    } finally {
      // Tắt trạng thái loading
      setIsLoading(false);
    }
  }, [moduleId, applyConfigToForm]);

  // Tự động tải lại dữ liệu mỗi khi đổi sang mô-đun khác
  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  // Tập ID câu hỏi đang có trong đề (dùng để chống chọn trùng trong Modal Ngân hàng câu hỏi)
  const existingQuestionIds = useMemo(() => {
    // Tạo Set để kiểm tra tồn tại trong O(1)
    return new Set<number>(questions.map((q) => q.questionId));
  }, [questions]);

  // Đếm số câu hỏi hiện đang nằm ngoài năng lực đào tạo của mô-đun
  const mismatchCount = useMemo(() => {
    // Đếm các phần tử có cờ isMatchingAbility bằng false
    return questions.filter((q) => !q.isMatchingAbility).length;
  }, [questions]);

  // Tập tên năng lực của mô-đun (dùng so khớp nhanh cho câu hỏi vừa thêm từ Modal)
  const moduleAbilityNameSet = useMemo(() => {
    // Chuyển danh sách tên năng lực sang Set để tra cứu nhanh
    return new Set<string>(config?.abilityNames ?? []);
  }, [config?.abilityNames]);

  /**
   * Cập nhật thời gian làm bài và đánh dấu form đã thay đổi.
   */
  const handleDurationChange = (value: number) => {
    // Lưu giá trị thời gian mới
    setDurationMinutes(value);
    // Xóa lỗi cũ của trường thời gian nếu người dùng đang sửa lại
    setFieldErrors((prev) => ({ ...prev, durationMinutes: undefined }));
    // Đánh dấu form có thay đổi chưa lưu
    setIsDirty(true);
  };

  /**
   * Cập nhật số lượng câu hỏi mục tiêu và đánh dấu form đã thay đổi.
   */
  const handleQuestionCountChange = (value: number) => {
    // Lưu giá trị số lượng câu hỏi mới
    setQuestionCount(value);
    // Xóa lỗi cũ của trường số lượng câu hỏi
    setFieldErrors((prev) => ({ ...prev, questionCount: undefined }));
    // Đánh dấu form có thay đổi chưa lưu
    setIsDirty(true);
  };

  /**
   * Bật/tắt chế độ tự động xáo trộn câu hỏi và đáp án mỗi lần thi.
   */
  const handleShuffleChange = (checked: boolean) => {
    // Cập nhật cờ xáo trộn
    setShuffleQuestions(checked);
    // Đánh dấu form có thay đổi chưa lưu
    setIsDirty(true);
  };

  /**
   * Chuyển đổi giữa chế độ Chọn thủ công và Sinh ngẫu nhiên từ kho năng lực.
   */
  const handleSelectionModeChange = (mode: ModuleTestSelectionMode) => {
    // Cập nhật phương thức sinh đề
    setSelectionMode(mode);
    // Xóa lỗi danh sách câu hỏi nếu chuyển sang chế độ ngẫu nhiên
    setFieldErrors((prev) => ({ ...prev, questions: undefined }));
    // Đánh dấu form có thay đổi chưa lưu
    setIsDirty(true);
  };

  /**
   * Thêm danh sách câu hỏi vừa chọn từ Modal Ngân hàng câu hỏi hoặc Modal Tạo nhanh vào đề vượt ải.
   */
  const handleAppendFromPicker = (incoming: PracticeQuestionResponse[]) => {
    setQuestions((prev) => {
      // Tập ID hiện có để tránh thêm trùng
      const seen = new Set<number>(prev.map((item) => item.questionId));
      // Chuyển đổi từng phần tử mới sang kiểu ModuleTestQuestionItem
      const mapped: ModuleTestQuestionItem[] = incoming
        .filter((item) => !seen.has(item.questionId))
        .map((item) => {
          // Kiểm tra câu hỏi vừa thêm có khớp ít nhất 1 năng lực đào tạo của mô-đun không
          const isMatching =
            moduleAbilityNameSet.size === 0 ||
            (item.abilityNames ?? []).some((name) => moduleAbilityNameSet.has(name));
          return {
            id: null,
            questionId: item.questionId,
            orderNo: 0,
            points: item.points || 10,
            questionName: item.questionName,
            questionSummary: item.questionSummary,
            questionType: item.questionType,
            partId: item.partId,
            partName: item.partName,
            section: item.section,
            difficulty: item.difficulty,
            parentId: item.parentId,
            parentName: item.parentName,
            abilityIds: [],
            abilityNames: item.abilityNames ?? [],
            isMatchingAbility: isMatching,
            hasAttemptHistory: false,
          };
        });
      // Gộp danh sách cũ và mới, giới hạn tối đa 100 câu và đánh lại thứ tự 1..N
      const merged = [...prev, ...mapped].slice(0, MAX_TEST_QUESTIONS);
      return merged.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    });
    // Xóa lỗi thiếu câu hỏi nếu trước đó đang báo lỗi
    setFieldErrors((prev) => ({ ...prev, questions: undefined }));
    // Đánh dấu form đã thay đổi
    setIsDirty(true);
  };

  /**
   * Di chuyển thứ tự một câu hỏi lên hoặc xuống trong danh sách đề.
   */
  const handleMoveQuestion = (index: number, direction: 'UP' | 'DOWN') => {
    // Tính chỉ số đích sau khi hoán đổi
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    // Bỏ qua nếu vượt ngoài biên mảng
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    setQuestions((prev) => {
      // Tạo bản sao mảng để hoán đổi bất biến
      const next = [...prev];
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      // Cập nhật lại số thứ tự orderNo liên tục
      return next.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    });
    // Đánh dấu form đã thay đổi
    setIsDirty(true);
  };

  /**
   * Gỡ một câu hỏi khỏi danh sách đề vượt ải (chặn gỡ nếu câu đã có lịch sử học viên thi).
   */
  const handleRemoveQuestion = (questionId: number) => {
    // Tìm câu hỏi cần gỡ để kiểm tra cờ lịch sử làm bài
    const target = questions.find((q) => q.questionId === questionId);
    if (target?.hasAttemptHistory) {
      // Thông báo rõ lý do không cho gỡ câu đã có lịch sử thi
      toast.warning('Câu hỏi này đã có lịch sử làm bài của học viên nên không thể gỡ khỏi đề.');
      return;
    }
    setQuestions((prev) => {
      // Lọc bỏ câu hỏi được chọn và đánh lại thứ tự orderNo
      const remaining = prev.filter((item) => item.questionId !== questionId);
      return remaining.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    });
    // Đánh dấu form đã thay đổi
    setIsDirty(true);
  };

  /**
   * Tự động bốc ngẫu nhiên N câu hỏi đúng năng lực của mô-đun từ Ngân hàng câu hỏi.
   */
  const handleAutoSelect = async () => {
    // Kiểm tra số câu yêu cầu phải lớn hơn 0 trước khi gọi API
    if (!Number.isFinite(questionCount) || questionCount <= 0) {
      setFieldErrors((prev) => ({
        ...prev,
        questionCount: 'Số lượng câu hỏi và thời gian làm bài phải lớn hơn 0',
      }));
      return;
    }

    // Bật trạng thái đang bốc câu hỏi ngẫu nhiên
    setIsAutoSelecting(true);
    try {
      // Gọi API yêu cầu Backend bốc ngẫu nhiên câu hỏi khớp năng lực của mô-đun
      const res = await adminModuleTestService.autoSelectQuestions(moduleId, {
        questionCount,
        onlyMatchingAbilities: true,
      });
      const picked = res.data ?? [];
      // Giữ lại các câu hỏi bắt buộc có lịch sử thi (nếu đang tồn tại) và ghép phần còn lại từ bộ vừa bốc
      const lockedQuestions = questions.filter((q) => q.hasAttemptHistory);
      const lockedIds = new Set(lockedQuestions.map((q) => q.questionId));
      const combined = [
        ...lockedQuestions,
        ...picked.filter((q) => !lockedIds.has(q.questionId)),
      ].slice(0, Math.max(questionCount, lockedQuestions.length));

      // Cập nhật lại danh sách câu hỏi và đánh thứ tự liên tục
      setQuestions(combined.map((item, idx) => ({ ...item, orderNo: idx + 1 })));
      setFieldErrors((prev) => ({ ...prev, questions: undefined }));
      setIsDirty(true);
      toast.success(`Đã tự động chọn ${combined.length} câu hỏi đúng năng lực mô-đun.`);
    } catch (err) {
      // Hiển thị chính xác thông báo từ Backend khi kho câu hỏi không đủ số lượng
      const { message } = extractApiError(err);
      toast.error(message);
    } finally {
      // Tắt trạng thái đang bốc câu hỏi
      setIsAutoSelecting(false);
    }
  };

  /**
   * Thực thi gửi yêu cầu lưu cấu hình lên Backend (hỗ trợ cờ confirmMismatchAbility).
   */
  const executeSave = async (confirmMismatchAbility: boolean) => {
    // Bước 1: Kiểm tra dữ liệu đầu vào bằng Zod schema ngay tại Frontend
    const parsed = moduleTestConfigSchema.safeParse({
      durationMinutes,
      questionCount,
      shuffleQuestions,
      selectionMode,
    });

    if (!parsed.success) {
      // Gom lỗi validation theo từng trường để hiển thị ngay dưới ô nhập liệu
      const nextErrors: { durationMinutes?: string; questionCount?: string; questions?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'durationMinutes') nextErrors.durationMinutes = issue.message;
        if (key === 'questionCount') nextErrors.questionCount = issue.message;
      }
      setFieldErrors(nextErrors);
      toast.error('Vui lòng kiểm tra lại các thông số cấu hình bài thi.');
      return;
    }

    // Bước 2: Nếu chọn chế độ thủ công, bắt buộc phải có ít nhất 1 câu hỏi trong đề
    if (selectionMode === 'MANUAL' && questions.length === 0) {
      setFieldErrors({ questions: 'Vui lòng chọn ít nhất 1 câu hỏi vào đề hoặc chuyển sang chế độ sinh đề ngẫu nhiên.' });
      toast.error('Vui lòng chọn ít nhất 1 câu hỏi cho bài thi vượt ải.');
      return;
    }

    // Bước 3: Bật cờ đang lưu và gửi request PUT lên Backend
    setIsSaving(true);
    try {
      const res = await adminModuleTestService.saveConfig(moduleId, {
        durationMinutes: parsed.data.durationMinutes,
        questionCount: parsed.data.questionCount,
        shuffleQuestions: parsed.data.shuffleQuestions,
        selectionMode: parsed.data.selectionMode,
        questionIds: selectionMode === 'MANUAL' ? questions.map((q) => q.questionId) : undefined,
        confirmMismatchAbility,
      });

      // Đóng hộp thoại xác nhận lệch năng lực (nếu đang mở)
      setIsMismatchModalOpen(false);
      // Đồng bộ lại state theo dữ liệu vừa lưu thành công từ máy chủ
      if (res.data) {
        applyConfigToForm(res.data);
      }
      toast.success('Lưu cấu hình bài thi vượt ải thành công.');
      // Thông báo cho component cha làm mới bảng tổng quan
      onSaved?.();
    } catch (err) {
      // Kiểm tra mã lỗi nghiệp vụ trả về từ Backend
      const { code, message } = extractApiError(err);
      if (code === 'MODULE_TEST_ABILITY_MISMATCH') {
        // Mở hộp thoại xác nhận sư phạm khi có câu hỏi ngoài năng lực mô-đun
        setIsMismatchModalOpen(true);
      } else {
        // Giữ nguyên toàn bộ dữ liệu người dùng đang nhập trên form và báo lỗi rõ ràng
        toast.error(message);
      }
    } finally {
      // Tắt cờ đang lưu
      setIsSaving(false);
    }
  };

  // Trả về toàn bộ state và hàm thao tác cho giao diện cấu hình
  return {
    config,
    isLoading,
    loadError,
    durationMinutes,
    questionCount,
    shuffleQuestions,
    selectionMode,
    questions,
    fieldErrors,
    isDirty,
    isSaving,
    isAutoSelecting,
    isMismatchModalOpen,
    existingQuestionIds,
    mismatchCount,
    refetch: fetchConfig,
    handleDurationChange,
    handleQuestionCountChange,
    handleShuffleChange,
    handleSelectionModeChange,
    handleAppendFromPicker,
    handleMoveQuestion,
    handleRemoveQuestion,
    handleAutoSelect,
    handleSave: () => void executeSave(false),
    handleConfirmMismatchSave: () => void executeSave(true),
    closeMismatchModal: () => setIsMismatchModalOpen(false),
  };
};
