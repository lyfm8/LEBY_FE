import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast, useConfirm } from '@/core/ui';
import type { ExamListItem, ExamStatus, ExamType } from '../types';
import { adminExamService } from '../services/adminExamService';
import { ExamTabs } from '../components/list/ExamTabs';
import { ExamFilterBar } from '../components/list/ExamFilterBar';
import { ExamTable } from '../components/list/ExamTable';
import '../admin-exam.css';

/**
 * Màn hình 1: Quản lý Đề thi chẩn đoán & Thi thử TOEIC (khớp hoàn toàn với bản thảo giao diện demo Ảnh 1).
 */
export const AdminExamListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const isAdmin = user?.role === 'ADMIN';

  // State bộ lọc và dữ liệu
  const [currentTab, setCurrentTab] = useState<'ALL' | ExamType>('ALL');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExamStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ExamType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Dữ liệu API
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tabCounts, setTabCounts] = useState({ all: 0, diagnostic: 0, mock: 0 });

  // Tải số lượng đếm trên Tabs
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
      // Fallback
    }
  }, []);

  // Tải danh sách đề thi
  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveType = currentTab !== 'ALL' ? currentTab : (typeFilter !== 'ALL' ? typeFilter : undefined);
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
    } catch (err: unknown) {
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

  // Xử lý chuyển tab
  const handleTabChange = (tab: 'ALL' | ExamType) => {
    setCurrentTab(tab);
    setCurrentPage(0);
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    setKeyword('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setCurrentPage(0);
  };

  // Thao tác Action Menu
  const isDiagnosticRoute = window.location.pathname.includes('/diagnostic-tests');

  const handleCreateNew = () => {
    if (isDiagnosticRoute) {
      navigate('/admin/diagnostic-tests?action=new');
    } else {
      navigate('/admin/exams/new');
    }
  };

  const handleView = (id: number) => {
    if (isDiagnosticRoute) {
      navigate(`/admin/diagnostic-tests?id=${id}`);
    } else {
      navigate(`/admin/exams/${id}`);
    }
  };

  const handleEdit = (id: number) => {
    if (isDiagnosticRoute) {
      navigate(`/admin/diagnostic-tests?id=${id}&edit=true`);
    } else {
      navigate(`/admin/exams/${id}?edit=true`);
    }
  };

  const handleActivate = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận kích hoạt đề thi',
      message: 'Nếu đây là đề thi chẩn đoán, đề thi đang kích hoạt trước đó sẽ tự động chuyển sang lưu trữ (Archive). Bạn có chắc chắn muốn kích hoạt đề thi này?',
      confirmText: 'Kích hoạt ngay',
      cancelText: 'Hủy',
    });

    if (!isConfirmed) return;

    try {
      await adminExamService.activate(id);
      toast.success('Kích hoạt đề thi thành công');
      fetchExams();
      fetchTabCounts();
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Kích hoạt đề thi thất bại';
      toast.error(errorMsg);
    }
  };

  const handleArchive = async (id: number) => {
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
      fetchExams();
      fetchTabCounts();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Xóa vĩnh viễn đề thi',
      message: 'Hành động này không thể hoàn tác. Lưu ý rằng các đề thi đã có học viên làm bài sẽ không thể xóa. Bạn có chắc chắn muốn tiếp tục?',
      confirmText: 'Xóa đề thi',
      cancelText: 'Hủy',
    });

    if (!isConfirmed) return;

    try {
      await adminExamService.delete(id);
      toast.success('Xóa đề thi thành công');
      fetchExams();
      fetchTabCounts();
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string })?.message || 'Không thể xóa đề thi đã có lượt làm bài';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="exam-page-container">
      {/* Page Title & Add Button */}
      <div className="exam-page-header">
        <div>
          <h1 className="exam-page-title">Quản lý Đề thi</h1>
          <p className="exam-page-subtitle">Quản lý các bộ đề thi đầu vào và đề thi thử TOEIC của hệ thống.</p>
        </div>

        <div className="exam-header-actions">
          <button
            type="button"
            className="btn-primary-orange"
            onClick={handleCreateNew}
          >
            <Plus size={18} />
            <span>Tạo đề thi mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ExamTabs currentTab={currentTab} counts={tabCounts} onChange={handleTabChange} />

      {/* Filter Bar */}
      <ExamFilterBar
        keyword={keyword}
        status={statusFilter}
        testType={typeFilter}
        onKeywordChange={setKeyword}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <ExamTable
        exams={exams}
        loading={loading}
        isAdmin={isAdmin}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={handleView}
        onEdit={handleEdit}
        onActivate={handleActivate}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
    </div>
  );
};
