import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast, useConfirm } from '@/core/ui';
import type { ExamDetail } from '../types';
import { adminExamService } from '../services/adminExamService';

/**
 * Custom hook quản lý logic chi tiết bộ đề thi và danh sách câu hỏi.
 * Tách biệt state, async fetching, và các action phê duyệt/lưu trữ khỏi View JSX.
 */
export const useExamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  // QUY TẮC PHÂN QUYỀN: Chỉ có ADMIN mới có quyền Kích hoạt / Lưu trữ đề thi
  const isAdmin = user?.role === 'ADMIN';

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPartFilter, setSelectedPartFilter] = useState<number | 'ALL'>('ALL');

  /**
   * Tải dữ liệu chi tiết của đề thi theo ID trên URL.
   */
  const fetchExamDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminExamService.getById(Number(id));
      if (res.data) {
        setExam(res.data);
      }
    } catch {
      toast.error('Không thể tải chi tiết đề thi');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchExamDetail();
  }, [fetchExamDetail]);

  // Điều hướng quay lại tương ứng theo URL gốc (chẩn đoán hoặc mock test)
  const isDiagnosticRoute = window.location.pathname.includes('/diagnostic-tests');
  const handleNavigateBack = useCallback(() => {
    navigate(isDiagnosticRoute ? '/admin/diagnostic-tests' : '/admin/exams');
  }, [navigate, isDiagnosticRoute]);

  /**
   * Kích hoạt đề thi sang trạng thái ACTIVE (Học viên có thể bắt đầu làm bài).
   */
  const handleActivate = useCallback(async () => {
    if (!exam) return;
    const isConfirmed = await confirm({
      title: 'Xác nhận kích hoạt đề thi',
      message: 'Nếu đây là đề thi chẩn đoán, đề thi đang kích hoạt trước đó sẽ tự động chuyển sang lưu trữ (Archive). Bạn có chắc chắn muốn kích hoạt đề thi này?',
      confirmText: 'Kích hoạt ngay',
      cancelText: 'Hủy',
    });

    if (!isConfirmed) return;

    try {
      await adminExamService.activate(exam.id);
      toast.success('Kích hoạt đề thi thành công');
      fetchExamDetail();
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Kích hoạt thất bại';
      toast.error(errorMsg);
    }
  }, [exam, confirm, toast, fetchExamDetail]);

  /**
   * Chuyển trạng thái đề thi sang ARCHIVE (Đóng đề thi).
   */
  const handleArchive = useCallback(async () => {
    if (!exam) return;
    const isConfirmed = await confirm({
      title: 'Lưu trữ đề thi',
      message: 'Học viên sẽ không thể bắt đầu làm bài mới từ đề thi này. Bạn có chắc chắn muốn lưu trữ?',
      confirmText: 'Lưu trữ',
      cancelText: 'Hủy',
    });

    if (!isConfirmed) return;

    try {
      await adminExamService.archive(exam.id);
      toast.success('Lưu trữ đề thi thành công');
      fetchExamDetail();
    } catch {
      toast.error('Thao tác thất bại');
    }
  }, [exam, confirm, toast, fetchExamDetail]);

  // Tối ưu lọc danh sách câu hỏi theo Part được chọn bằng useMemo
  const filteredQuestions = useMemo(() => {
    if (!exam) return [];
    if (selectedPartFilter === 'ALL') return exam.questions;
    return exam.questions.filter((q) => q.partNumber === selectedPartFilter);
  }, [exam, selectedPartFilter]);

  return {
    exam,
    loading,
    selectedPartFilter,
    setSelectedPartFilter,
    filteredQuestions,
    isAdmin,
    handleNavigateBack,
    handleActivate,
    handleArchive,
  };
};
