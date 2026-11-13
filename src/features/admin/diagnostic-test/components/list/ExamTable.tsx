import React from 'react';
import { Clock, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const startItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div className="exam-table-card">
      <table className="exam-table">
        <thead>
          <tr>
            <th className="stt-cell">STT</th>
            <th>TÊN ĐỀ THI</th>
            <th>LOẠI ĐỀ</th>
            <th>SỐ CÂU</th>
            <th>THỜI GIAN</th>
            <th>TRẠNG THÁI</th>
            <th>CẬP NHẬT</th>
            <th style={{ width: '60px', textAlign: 'center' }}>THAO TÁC</th>
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
                    {exam.description && <div className="exam-title-sub">{exam.description}</div>}
                  </td>

                  <td>
                    {exam.testType === 'DIAGNOSTIC' ? (
                      <span className="badge-diagnostic">Diagnostic</span>
                    ) : (
                      <span className="badge-mock">Mock Test</span>
                    )}
                  </td>

                  <td>
                    <div className="exam-meta-cell">
                      <HelpCircle size={15} className="text-slate-400" />
                      <span>{exam.totalQuestions} câu</span>
                    </div>
                  </td>

                  <td>
                    <div className="exam-meta-cell">
                      <Clock size={15} className="text-slate-400" />
                      <span>{exam.durationMinutes} phút</span>
                    </div>
                  </td>

                  <td>
                    <span className={`dot-status-badge ${exam.examStatus.toLowerCase()}`}>
                      <span className="dot-indicator" />
                      <span>{exam.examStatus === 'ACTIVE' ? 'Active' : exam.examStatus === 'ARCHIVE' ? 'Archive' : 'Draft'}</span>
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 500 }}>
                      {formatDate(exam.updatedAt)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                      bởi {exam.updatedBy || 'Admin'}
                    </div>
                  </td>

                  <td style={{ textAlign: 'center' }}>
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

      <div className="exam-table-footer">
        <div>
          Hiển thị {startItem}-{endItem} trong tổng số {totalItems} đề thi
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="exam-btn-reset"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`exam-btn-reset ${currentPage === i ? 'active' : ''}`}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                justifyContent: 'center',
                backgroundColor: currentPage === i ? '#F45B0B' : 'transparent',
                color: currentPage === i ? '#FFFFFF' : '#64748B',
                borderColor: currentPage === i ? '#F45B0B' : '#E2E8F0',
                fontWeight: 600,
              }}
              onClick={() => onPageChange(i)}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            className="exam-btn-reset"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
            disabled={currentPage >= totalPages - 1 || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

