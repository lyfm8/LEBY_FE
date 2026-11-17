import { useState, useEffect, useCallback } from 'react';
import { adminQuestionService } from '../services/adminQuestionService';
import { usePartAbilityOptions } from './usePartAbilityOptions';
import type { QuestionFilterParams, QuestionListItem } from '../types';

/**
 * Custom hook quản lý danh sách Ngân hàng câu hỏi (Admin Question Bank).
 * Xử lý: nạp câu hỏi, bộ lọc đa tiêu chí, phân trang và hộp thoại xác nhận xóa.
 */
export function useQuestionList() {
  const [filters, setFilters] = useState<QuestionFilterParams>({
    page: 0,
    size: 10,
    structureType: 'ALL',
  });

  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dialog xác nhận xóa
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string; isGroup: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Dữ liệu options Part & Ability theo filter
  const { parts, abilities } = usePartAbilityOptions(filters.partId);

  /**
   * Tải danh sách câu hỏi dựa trên bộ lọc filters hiện tại.
   */
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminQuestionService.getQuestions(filters);
      if (res.success && res.data) {
        setQuestions(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.totalItems || 0);
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Lỗi khi tải danh sách câu hỏi';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleFilterChange = useCallback((newFilters: Partial<QuestionFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      page: 0,
      size: 10,
      structureType: 'ALL',
      keyword: '',
      section: undefined,
      partId: undefined,
      abilityId: undefined,
      difficulty: undefined,
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await adminQuestionService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchQuestions();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Không thể xóa câu hỏi này';
      setErrorMessage(message);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchQuestions]);

  return {
    filters,
    questions,
    totalPages,
    totalItems,
    isLoading,
    errorMessage,
    setErrorMessage,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    parts,
    abilities,
    handleFilterChange,
    handleResetFilters,
    handleDeleteConfirm,
    refetchQuestions: fetchQuestions,
  };
}
