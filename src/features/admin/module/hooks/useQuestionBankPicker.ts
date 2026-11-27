import { useState, useCallback, useEffect } from 'react';
import { adminModuleService } from '../services/adminModuleService';
import type {
  QuestionBankFilterParams,
  QuestionBankItem,
  QuestionStructureFilter,
} from '../types';

/**
 * Kích thước trang mặc định khi duyệt Ngân hàng câu hỏi trong Modal chọn câu hỏi.
 */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Tham số đầu vào cho hook useQuestionBankPicker.
 */
interface UseQuestionBankPickerOptions {
  // Cờ cho biết Modal có đang mở hay không (chỉ gọi API khi Modal mở)
  isOpen: boolean;
  // ID Part mặc định của Module hiện tại để lọc sẵn câu hỏi phù hợp
  defaultPartId?: number | null;
}

/**
 * Custom hook quản lý tìm kiếm, lọc và phân trang Ngân hàng câu hỏi trong Modal chọn câu hỏi (Tab 3 - UC A05).
 * Đảm bảo tách bạch hoàn toàn logic gọi API khỏi UI và xử lý đủ 4 trạng thái Loading/Success/Error/Empty.
 *
 * @param options Cấu hình trạng thái mở Modal và Part mặc định
 * @returns Danh sách câu hỏi, phân trang, trạng thái tải/lỗi và các hàm điều khiển bộ lọc
 */
export const useQuestionBankPicker = ({
  isOpen,
  defaultPartId,
}: UseQuestionBankPickerOptions) => {
  // Danh sách câu hỏi trả về từ trang hiện tại của Ngân hàng câu hỏi
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  // Trạng thái đang gọi API tải danh sách câu hỏi
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Thông báo lỗi nếu gọi API thất bại
  const [error, setError] = useState<string | null>(null);

  // Từ khóa tìm kiếm theo tên câu hỏi
  const [keyword, setKeyword] = useState<string>('');
  // Bộ lọc Part (undefined nghĩa là lấy tất cả các Part)
  const [partId, setPartId] = useState<number | undefined>(defaultPartId ?? undefined);
  // Bộ lọc Năng lực (Ability)
  const [abilityId, setAbilityId] = useState<number | undefined>(undefined);
  // Bộ lọc độ khó (1 - 5)
  const [difficulty, setDifficulty] = useState<number | undefined>(undefined);
  // Bộ lọc cấu trúc câu hỏi: ALL | STANDALONE | GROUP
  const [structureType, setStructureType] = useState<QuestionStructureFilter>('ALL');
  // Số trang hiện tại (bắt đầu từ 0 theo chuẩn Spring Data Pageable)
  const [page, setPage] = useState<number>(0);
  // Tổng số trang và tổng số phần tử từ Backend
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Đồng bộ lại bộ lọc Part mặc định mỗi khi Modal được mở ra cho một bài học khác
  useEffect(() => {
    if (isOpen) {
      // Đặt lại Part mặc định theo Module hiện tại để giáo viên tìm đúng câu hỏi nhanh nhất
      setPartId(defaultPartId ?? undefined);
      // Đặt lại trang về 0 khi mở lại Modal
      setPage(0);
    }
  }, [isOpen, defaultPartId]);

  /**
   * Hàm gọi API lấy danh sách câu hỏi từ Ngân hàng câu hỏi theo bộ lọc hiện tại.
   */
  const fetchQuestions = useCallback(async () => {
    // Không gọi API nếu Modal đang đóng
    if (!isOpen) return;

    // Bật trạng thái loading và xóa thông báo lỗi cũ
    setIsLoading(true);
    setError(null);

    try {
      // Đóng gói các tham số lọc hợp lệ gửi lên Backend
      const params: QuestionBankFilterParams = {
        page,
        size: DEFAULT_PAGE_SIZE,
        structureType,
      };
      // Chỉ đính kèm từ khóa nếu người dùng có nhập nội dung khác rỗng
      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }
      // Chỉ đính kèm partId nếu người dùng chọn một Part cụ thể
      if (partId !== undefined) {
        params.partId = partId;
      }
      // Chỉ đính kèm abilityId nếu người dùng chọn một Ability cụ thể
      if (abilityId !== undefined) {
        params.abilityId = abilityId;
      }
      // Chỉ đính kèm độ khó nếu người dùng chọn mức độ khó cụ thể
      if (difficulty !== undefined) {
        params.difficulty = difficulty;
      }

      // Thực hiện gọi API tìm kiếm Ngân hàng câu hỏi
      const res = await adminModuleService.searchQuestionBank(params);
      // Lưu danh sách câu hỏi trả về vào state (fallback mảng rỗng nếu null)
      setQuestions(res.data ?? []);
      // Cập nhật thông tin phân trang từ response pagination
      setTotalPages(res.pagination?.totalPages ?? 0);
      setTotalItems(res.pagination?.totalItems ?? (res.data?.length ?? 0));
    } catch {
      // Lưu thông báo lỗi thân thiện để hiển thị trạng thái Error kèm nút thử lại
      setError('Không thể tải danh sách từ Ngân hàng câu hỏi. Vui lòng thử lại.');
      // Xóa danh sách cũ để tránh hiển thị dữ liệu lệch
      setQuestions([]);
    } finally {
      // Tắt trạng thái loading sau khi hoàn tất
      setIsLoading(false);
    }
  }, [isOpen, page, keyword, partId, abilityId, difficulty, structureType]);

  // Tự động gọi lại API mỗi khi bộ lọc hoặc số trang thay đổi (debounce nhẹ 250ms cho keyword)
  useEffect(() => {
    if (!isOpen) return;
    // Dùng timer debounce để tránh bắn API liên tục khi người dùng đang gõ từ khóa
    const timer = window.setTimeout(() => {
      void fetchQuestions();
    }, 250);
    // Dọn dẹp timer cũ nếu người dùng tiếp tục gõ
    return () => window.clearTimeout(timer);
  }, [isOpen, fetchQuestions]);

  // Các hàm cập nhật bộ lọc tự động đưa số trang về 0 để tránh xem trang trống
  const updateKeyword = useCallback((value: string) => {
    setKeyword(value);
    setPage(0);
  }, []);

  const updatePartId = useCallback((value: number | undefined) => {
    setPartId(value);
    // Reset Ability vì Ability phụ thuộc vào Part vừa chọn
    setAbilityId(undefined);
    setPage(0);
  }, []);

  const updateAbilityId = useCallback((value: number | undefined) => {
    setAbilityId(value);
    setPage(0);
  }, []);

  const updateDifficulty = useCallback((value: number | undefined) => {
    setDifficulty(value);
    setPage(0);
  }, []);

  const updateStructureType = useCallback((value: QuestionStructureFilter) => {
    setStructureType(value);
    setPage(0);
  }, []);

  // Trả về toàn bộ state và hàm điều khiển cho Modal sử dụng
  return {
    questions,
    isLoading,
    error,
    keyword,
    partId,
    abilityId,
    difficulty,
    structureType,
    page,
    totalPages,
    totalItems,
    setPage,
    updateKeyword,
    updatePartId,
    updateAbilityId,
    updateDifficulty,
    updateStructureType,
    refetch: fetchQuestions,
  };
};
