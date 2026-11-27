import React from 'react';
import { formatDateTimeVi, formatDurationSeconds } from '../../utils/schema';
import type { AdminUserMockTestHistoryItem } from '../../types';

interface UserMockTestHistoryTabProps {
  // Danh sách các lượt thi thử 200 câu đã nộp (FULL_MOCK_TEST)
  history: AdminUserMockTestHistoryItem[];
}

/**
 * Tab hiển thị điểm thi thử TOEIC (Listening / Reading / Tổng điểm) được tính động từ Backend.
 */
export const UserMockTestHistoryTab: React.FC<UserMockTestHistoryTabProps> = ({ history }) => {
  // Hiển thị thông báo đơn giản nếu học viên chưa có lượt thi thử đã hoàn thành
  if (history.length === 0) {
    return (
      <div className="user-detail-empty">
        <p>Học viên chưa có lượt thi thử nào</p>
      </div>
    );
  }

  // Render bảng kết quả thi thử
  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Đề thi thử</th>
            <th>Ngày hoàn thành</th>
            <th>Thời gian làm</th>
            <th>Nghe (Listening)</th>
            <th>Đọc (Reading)</th>
            <th>Tổng điểm TOEIC</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.attemptId}>
              <td className="user-detail-cell-strong">{item.testTitle}</td>
              <td>{formatDateTimeVi(item.completedAt)}</td>
              <td>{formatDurationSeconds(item.durationSeconds)}</td>
              <td>
                {item.listeningScore}/495 ({item.listeningCorrect}/{item.listeningTotal})
              </td>
              <td>
                {item.readingScore}/495 ({item.readingCorrect}/{item.readingTotal})
              </td>
              <td className="user-detail-cell-strong">{item.totalScore}/990</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
