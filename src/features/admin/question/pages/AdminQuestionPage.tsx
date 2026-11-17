import React from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Layers, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuestionList } from '../hooks/useQuestionList';
import { QuestionFilterBar } from '../components/QuestionFilterBar';
import { QuestionTable } from '../components/QuestionTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import '../admin-question.css';

/**
 * Presentational Container Component: Ngân hàng câu hỏi TOEIC.
 * Toàn bộ logic (state, API fetching, filter, pagination, delete confirm) được ủy quyền cho useQuestionList.
 */
export const AdminQuestionPage: React.FC = () => {
  const navigate = useNavigate();

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
  } = useQuestionList();

  return (
    <div className="admin-question-page">
      {/* Header trang */}
      <div className="admin-question-header">
        <div>
          <h1 className="admin-question-title">Ngân hàng câu hỏi</h1>
          <p className="admin-question-subtitle">
            Quản lý, biên soạn và tổ chức toàn bộ kho câu hỏi TOEIC tại một nơi.
          </p>
        </div>

        <div className="admin-question-header-actions">
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
      {totalItems > 0 && (
        <div className="question-pagination-bar">
          <div className="pagination-counter">
            Hiển thị{' '}
            <strong>
              {questions.length > 0 ? (filters.page || 0) * (filters.size || 10) + 1 : 0}
            </strong>{' '}
            –{' '}
            <strong>
              {Math.min(((filters.page || 0) + 1) * (filters.size || 10), totalItems)}
            </strong>{' '}
            trong tổng số <strong>{totalItems}</strong> câu hỏi
          </div>

          <div className="pagination-btn-group">
            <button
              type="button"
              className="pagination-nav-btn"
              disabled={(filters.page || 0) <= 0}
              onClick={() => handleFilterChange({ page: (filters.page || 0) - 1 })}
              title="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ padding: '0 0.5rem', fontSize: '0.8125rem', color: '#4b5563', fontWeight: 500 }}>
              Trang {(filters.page || 0) + 1} / {totalPages}
            </span>
            <button
              type="button"
              className="pagination-nav-btn"
              disabled={(filters.page || 0) + 1 >= totalPages}
              onClick={() => handleFilterChange({ page: (filters.page || 0) + 1 })}
              title="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};
