import React from 'react';
import { Plus } from 'lucide-react';
import { useExamList } from '../hooks/useExamList';
import { ExamTabs } from '../components/list/ExamTabs';
import { ExamFilterBar } from '../components/list/ExamFilterBar';
import { ExamTable } from '../components/list/ExamTable';
import '../admin-exam.css';

/**
 * Presentational Page Component: Quản lý Đề thi chẩn đoán & Thi thử TOEIC.
 * Toàn bộ logic (tabs, filter, API fetching, pagination, action confirmation) được quản lý bởi useExamList.
 */
export const AdminExamListPage: React.FC = () => {
  const {
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
  } = useExamList();

  return (
    <div className="exam-page-container">
      {/* Page Title & Add Button */}
      <div className="exam-page-header">
        <div>
          <h1 className="exam-page-title">Quản lý Đề thi</h1>
          <p className="exam-page-subtitle">
            Quản lý các bộ đề thi đầu vào và đề thi thử TOEIC của hệ thống.
          </p>
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
