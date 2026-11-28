import React from 'react';
import { AdminPagination } from '@/features/admin/layout/components/AdminPagination';
import type { ExamListItem } from '../../types';
import { ExamActionMenu } from './ExamActionMenu';

interface ExamTableProps {
  exams: ExamListItem[];
  loading: boolean;
  isAdmin: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onActivate: (id: number) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Bảng hiển thị danh sách Đề thi (khớp hoàn toàn với bản thảo giao diện demo Ảnh 1).
 */
export const ExamTable: React.FC<ExamTableProps> = ({
  exams,
  loading,
  isAdmin,
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onActivate,
  onArchive,
  onDelete,
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <>
      <div className="exam-table-card">
        <table className="exam-table">
          <thead>
            <tr>
              <th className="stt-cell">STT</th>
              <th>Tên đề thi</th>
              <th>Loại đề</th>
              <th>Số câu</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  Đang tải dữ liệu đề thi...
                </td>
              </tr>
            ) : exams.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                  Không tìm thấy bộ đề thi nào phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              exams.map((exam, index) => {
                const sttFormatted = String(currentPage * pageSize + index + 1).padStart(2, '0');

                return (
                  <tr key={exam.id}>
                    <td className="stt-cell">{sttFormatted}</td>

                    <td className="exam-title-cell">
                      <div className="exam-title-main">{exam.title}</div>
                    </td>

                    <td>
                      {exam.testType === 'DIAGNOSTIC' ? (
                        <span className="badge-diagnostic">Chẩn đoán</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="badge-mock">Thi thử</span>
                          {/* Gắn nhãn phụ phân biệt đề đầu ra OUTPUT với đề luyện tập PRACTICE */}
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              backgroundColor: exam.examTag === 'OUTPUT' ? '#EFF6FF' : '#F1F5F9',
                              color: exam.examTag === 'OUTPUT' ? '#1D4ED8' : '#475569',
                              border: exam.examTag === 'OUTPUT' ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                            }}
                          >
                            {exam.examTag === 'OUTPUT' ? 'Đầu ra' : 'Luyện tập'}
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="exam-meta-cell">
                        <span>{exam.totalQuestions} câu</span>
                      </div>
                    </td>

                    <td>
                      <div className="exam-meta-cell">
                        <span>{exam.durationMinutes} phút</span>
                      </div>
                    </td>

                    <td>
                      <span className={`dot-status-badge ${exam.examStatus.toLowerCase()}`}>
                        <span className="dot-indicator" />
                        <span>{exam.examStatus === 'ACTIVE' ? 'Đang hoạt động' : exam.examStatus === 'ARCHIVE' ? 'Đã lưu trữ' : 'Bản nháp'}</span>
                      </span>
                    </td>

                    <td>
                      <div className="exam-date-primary">
                        {formatDate(exam.updatedAt)}
                      </div>
                      <div className="exam-date-sub">
                        bởi {exam.updatedBy || 'Admin'}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <ExamActionMenu
                        exam={exam}
                        isAdmin={isAdmin}
                        onView={onView}
                        onEdit={onEdit}
                        onActivate={onActivate}
                        onArchive={onArchive}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang đồng bộ chuẩn Ngân hàng câu hỏi */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="đề thi"
        onPageChange={onPageChange}
      />
    </>
  );
};

