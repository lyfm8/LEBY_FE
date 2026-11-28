import React, { useState } from 'react';
import { AlertCircle, FileSpreadsheet, ImagePlus, Layers, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminPagination } from '@/features/admin/layout/components/AdminPagination';
import { useQuestionList } from '../hooks/useQuestionList';
import { QuestionFilterBar } from '../components/QuestionFilterBar';
import { QuestionTable } from '../components/QuestionTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { MediaLibraryModal } from '../components/media/MediaLibraryModal';
import { ImportQuestionsModal } from '../components/import/ImportQuestionsModal';
import '../admin-question.css';

/**
 * Presentational Container Component: Ngân hàng câu hỏi TOEIC.
 * Toàn bộ logic (state, API fetching, filter, pagination, delete confirm) được ủy quyền cho useQuestionList.
 */
export const AdminQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  const {
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
    refetchQuestions,
  } = useQuestionList();

  return (
    <div className="admin-page-container admin-question-page">
      {/* Header trang */}
      <div className="admin-page-header admin-question-header">
        <div>
          <h1 className="admin-page-title admin-question-title">Ngân hàng câu hỏi</h1>
          <p className="admin-page-subtitle admin-question-subtitle">
            Quản lý, biên soạn và tổ chức toàn bộ kho câu hỏi TOEIC tại một nơi.
          </p>
        </div>

        <div className="admin-question-header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsMediaModalOpen(true)}
          >
            <ImagePlus size={16} />
            <span>Upload media</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsImportModalOpen(true)}
          >
            <FileSpreadsheet size={16} />
            <span>Nhập từ tệp</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin/question-groups/new')}
          >
            <Layers size={16} />
            <span>Tạo chùm câu hỏi</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/admin/questions/new')}
          >
            <Plus size={16} />
            <span>Tạo câu hỏi đơn</span>
          </button>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="admin-alert-banner error">
          <div className="admin-alert-content">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="admin-alert-close"
            title="Đóng thông báo"
          >
            ✕
          </button>
        </div>
      )}

      {/* Thanh lọc câu hỏi */}
      <QuestionFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        parts={parts}
        abilities={abilities}
      />

      {/* Bảng danh sách câu hỏi */}
      <QuestionTable
        questions={questions}
        isLoading={isLoading}
        onDelete={(id, name, isGroup) => setDeleteTarget({ id, name, isGroup })}
        onResetFilters={handleResetFilters}
      />

      {/* Phân trang */}
      <AdminPagination
        currentPage={filters.page || 0}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={filters.size || 10}
        itemLabel="câu hỏi"
        onPageChange={(page) => handleFilterChange({ page })}
      />

      {/* Dialog xác nhận xóa câu hỏi */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={deleteTarget?.isGroup ? 'Xóa chùm câu hỏi?' : 'Xóa câu hỏi đơn?'}
        message={
          deleteTarget?.isGroup
            ? `Chùm câu hỏi "${deleteTarget.name}" cùng tất cả các câu hỏi con sẽ bị xóa hoàn toàn khỏi ngân hàng.`
            : `Câu hỏi "${deleteTarget?.name}" sẽ bị xóa khỏi ngân hàng câu hỏi.`
        }
        warningNote={
          deleteTarget?.isGroup
            ? 'Các tệp Media chung đính kèm sẽ được tự động giải phóng.'
            : undefined
        }
        confirmText={deleteTarget?.isGroup ? 'Xóa chùm câu hỏi' : 'Xóa câu hỏi'}
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Popup Upload Media & Lịch sử phân trang */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
      />

      {/* Modal Import câu hỏi hàng loạt từ Excel */}
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={refetchQuestions}
        onOpenMediaModal={() => setIsMediaModalOpen(true)}
      />
    </div>
  );
};
