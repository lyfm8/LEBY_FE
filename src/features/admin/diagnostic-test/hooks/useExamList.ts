import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast, useConfirm } from '@/core/ui';
import { adminExamService } from '../services/adminExamService';
import type { ExamListItem, ExamStatus, ExamType } from '../types';

/**
 * Custom hook quản lý danh sách Đề thi (Diagnostic Test & Full Mock Test).
 * Xử lý: nạp dữ liệu, tabs đếm số lượng, bộ lọc trạng thái, phân trang,
 * kích hoạt, lưu trữ và xóa đề thi.
 */
export function useExamList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const isAdmin = user?.role === 'ADMIN';

  // State bộ lọc và phân trang
  const [currentTab, setCurrentTab] = useState<'ALL' | ExamType>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ExamStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ExamType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 10;

  // Dữ liệu API
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [tabCounts, setTabCounts] = useState({ all: 0, diagnostic: 0, mock: 0 });

  /**
   * Tải số lượng đếm trên Tabs.
   */
  const fetchTabCounts = useCallback(async () => {
    try {
      const res = await adminExamService.getExamTabCounts();
      if (res.data) {
        setTabCounts({
          all: res.data.all || 0,
          diagnostic: res.data.diagnostic || 0,
          mock: res.data.mock || 0,
        });
      }
    } catch {
      // Fallback im lặng
    }
  }, []);

  /**
   * Tải danh sách đề thi theo bộ lọc hiện tại.
   */
  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveType =
        currentTab !== 'ALL' ? currentTab : typeFilter !== 'ALL' ? typeFilter : undefined;
      const effectiveStatus = statusFilter !== 'ALL' ? statusFilter : undefined;

      const res = await adminExamService.getExams({
        page: currentPage,
        size: pageSize,
        keyword: keyword.trim() || undefined,
        testType: effectiveType,
        examStatus: effectiveStatus,
      });

      if (res.data) {
        setExams(res.data);
        if (res.pagination) {
          setTotalItems(res.pagination.totalItems);
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch {
      toast.error('Không thể tải danh sách đề thi');
    } finally {
      setLoading(false);
    }
  }, [currentTab, typeFilter, statusFilter, keyword, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchTabCounts();
  }, [fetchTabCounts]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleTabChange = useCallback((tab: 'ALL' | ExamType) => {
    setCurrentTab(tab);
    setCurrentPage(0);
  }, []);

  const handleResetFilters = useCallback(() => {
    setKeyword('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setCurrentPage(0);
  }, []);

  // Nhận diện route hiện tại để điều hướng tương thích
  const isDiagnosticRoute = window.location.pathname.includes('/diagnostic-tests');

  const handleCreateNew = useCallback(() => {
    if (isDiagnosticRoute) {
      navigate('/admin/diagnostic-tests?action=new');
    } else {
      navigate('/admin/exams/new');
    }
  }, [isDiagnosticRoute, navigate]);

  const handleView = useCallback(
    (id: number) => {
      if (isDiagnosticRoute) {
        navigate(`/admin/diagnostic-tests?id=${id}`);
      } else {
        navigate(`/admin/exams/${id}`);
      }
    },
    [isDiagnosticRoute, navigate]
  );

  const handleEdit = useCallback(
    (id: number) => {
      if (isDiagnosticRoute) {
        navigate(`/admin/diagnostic-tests?id=${id}&edit=true`);
      } else {
        navigate(`/admin/exams/${id}?edit=true`);
      }
    },
    [isDiagnosticRoute, navigate]
  );

  const handleActivate = useCallback(
    async (id: number) => {
      const isConfirmed = await confirm({
        title: 'Xác nhận kích hoạt đề thi',
        message:
          'Nếu đây là đề thi chẩn đoán, đề thi đang kích hoạt trước đó sẽ tự động chuyển sang lưu trữ (Archive). Bạn có chắc chắn muốn kích hoạt đề thi này?',
        confirmText: 'Kích hoạt ngay',
        cancelText: 'Hủy',
      });

      if (!isConfirmed) return;

      try {
        await adminExamService.activate(id);
        toast.success('Kích hoạt đề thi thành công');
        await Promise.all([fetchExams(), fetchTabCounts()]);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Kích hoạt đề thi thất bại';
        toast.error(errorMsg);
      }
    },
    [confirm, toast, fetchExams, fetchTabCounts]
  );

  const handleArchive = useCallback(
    async (id: number) => {
      const isConfirmed = await confirm({
        title: 'Lưu trữ đề thi',
        message: 'Học viên sẽ không thể bắt đầu làm bài mới từ đề thi này. Bạn có chắc chắn muốn lưu trữ?',
        confirmText: 'Lưu trữ',
        cancelText: 'Hủy',
      });

      if (!isConfirmed) return;

      try {
        await adminExamService.archive(id);
        toast.success('Lưu trữ đề thi thành công');
        await Promise.all([fetchExams(), fetchTabCounts()]);
      } catch {
        toast.error('Thao tác thất bại');
      }
    },
    [confirm, toast, fetchExams, fetchTabCounts]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      const isConfirmed = await confirm({
        title: 'Xóa vĩnh viễn đề thi',
        message:
          'Hành động này không thể hoàn tác. Lưu ý rằng các đề thi đã có học viên làm bài sẽ không thể xóa. Bạn có chắc chắn muốn tiếp tục?',
        confirmText: 'Xóa đề thi',
        cancelText: 'Hủy',
      });

      if (!isConfirmed) return;

      try {
        await adminExamService.delete(id);
        toast.success('Xóa đề thi thành công');
        await Promise.all([fetchExams(), fetchTabCounts()]);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Không thể xóa đề thi đã có lượt làm bài';
        toast.error(errorMsg);
      }
    },
    [confirm, toast, fetchExams, fetchTabCounts]
  );

  return {
    isAdmin,
    currentTab,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    exams,
    totalItems,
    totalPages,
    loading,
    tabCounts,
    handleTabChange,
    handleResetFilters,
    handleCreateNew,
    handleView,
    handleEdit,
    handleActivate,
    handleArchive,
    handleDelete,
    refetchExams: fetchExams,
    refetchTabCounts: fetchTabCounts,
  };
}
