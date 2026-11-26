import React from 'react';
import { formatDateTimeVi, formatDurationSeconds } from '../../utils/schema';
import type { AdminUserDiagnosticHistoryItem } from '../../types';

interface UserDiagnosticHistoryTabProps {
  // Danh sách các lượt làm bài thi chẩn đoán của học viên
  history: AdminUserDiagnosticHistoryItem[];
}

// Quy đổi mã trạng thái bài thi sang chữ tiếng Việt đơn giản
function formatAttemptStatus(status: string): string {
  // Map từng giá trị Enum EAttemptStatus
  if (status === 'SUBMITTED') return 'Đã nộp';
  if (status === 'IN_PROGRESS') return 'Đang làm';
  if (status === 'TIMED_OUT') return 'Hết giờ';
  if (status === 'ABANDONED') return 'Đã hủy';
  // Trả nguyên bản nếu có trạng thái khác
  return status;
}

/**
 * Tab hiển thị lịch sử làm bài thi chẩn đoán đầu vào dưới dạng bảng gọn nhẹ.
 */
export const UserDiagnosticHistoryTab: React.FC<UserDiagnosticHistoryTabProps> = ({ history }) => {
  // Trạng thái rỗng khi học viên chưa tham gia bài thi chẩn đoán nào
  if (history.length === 0) {
    return (
      <div className="user-detail-empty">
        <p>Học viên chưa có lịch sử làm bài thi chẩn đoán nào</p>
      </div>
    );
  }

  // Render bảng lịch sử các lượt làm bài chẩn đoán
  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Đề thi</th>
            <th>Mục tiêu</th>
            <th>Ngày làm</th>
            <th>Thời gian làm</th>
            <th>Câu đúng</th>
            <th>Điểm dự đoán</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.attemptId}>
              <td className="user-detail-cell-strong">{item.testTitle}</td>
              <td>{item.targetScore ? `AIM ${item.targetScore}` : '—'}</td>
              <td>{formatDateTimeVi(item.completedAt || item.startedAt)}</td>
              <td>{formatDurationSeconds(item.durationSeconds)}</td>
              <td>
                {item.correctAnswers !== null && item.totalQuestions !== null
                  ? `${item.correctAnswers}/${item.totalQuestions}`
                  : '—'}
              </td>
              <td className="user-detail-cell-strong">
                {item.predictedScore !== null ? `${item.predictedScore}/990` : '—'}
              </td>
              <td>{formatAttemptStatus(item.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
