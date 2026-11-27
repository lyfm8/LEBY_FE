import React from 'react';
import { formatDateTimeVi } from '../../utils/schema';
import type { AdminUserModuleTestHistoryItem } from '../../types';

interface UserModuleTestHistoryTabProps {
  // Danh sách các lần thi vượt ải mô-đun của học viên
  history: AdminUserModuleTestHistoryItem[];
}

/**
 * Tab hiển thị lịch sử các lần thi vượt ải mô-đun theo bảng đơn giản giống ResultHistoryTable của Student.
 */
export const UserModuleTestHistoryTab: React.FC<UserModuleTestHistoryTabProps> = ({ history }) => {
  // Hiển thị trạng thái rỗng nếu chưa có lượt thi vượt ải nào
  if (history.length === 0) {
    return (
      <div className="user-detail-empty">
        <p>Học viên chưa có lịch sử thi vượt ải mô-đun nào</p>
      </div>
    );
  }

  // Render bảng lịch sử vượt ải mô-đun
  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mô-đun</th>
            <th>Phần thi</th>
            <th>Điểm số</th>
            <th>Điểm đạt chuẩn</th>
            <th>Kết quả</th>
            <th>Thời điểm</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => {
            // Xác định chữ hiển thị kết quả dựa trên trạng thái đã nộp và result PASS/FAIL
            const resultText = !item.isSubmitted
              ? 'Chưa nộp'
              : item.result === 'PASS'
                ? 'Đạt'
                : 'Chưa đạt';

            // Render từng dòng lịch sử
            return (
              <tr key={item.attemptId}>
                <td className="user-detail-cell-strong">{item.moduleTitle}</td>
                <td>{item.partName || '—'}</td>
                <td className="user-detail-cell-strong">
                  {item.isSubmitted && item.score !== null ? `${item.score}/100` : '—'}
                </td>
                <td>{item.passScore !== null ? `${item.passScore}/100` : '—'}</td>
                <td
                  className={
                    !item.isSubmitted
                      ? ''
                      : item.result === 'PASS'
                        ? 'user-result-pass'
                        : 'user-result-fail'
                  }
                >
                  {resultText}
                </td>
                <td>{formatDateTimeVi(item.submittedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
