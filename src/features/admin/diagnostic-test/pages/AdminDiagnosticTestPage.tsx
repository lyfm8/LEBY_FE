import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AdminExamListPage } from './AdminExamListPage';
import { AdminExamCreatePage } from './AdminExamCreatePage';
import { AdminExamDetailPage } from './AdminExamDetailPage';

/**
 * Controller Router thông minh tại /admin/diagnostic-tests:
 * Hỗ trợ chuyển đổi mượt mà giữa Danh sách, Tạo đề mới và Chi tiết đề
 * ngay trên route hiện tại mà không làm xung đột file routes/index.tsx của Agent Văn.
 */
export const AdminDiagnosticTestPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isNew = location.pathname.endsWith('/new') || searchParams.get('action') === 'new';
  const examId = searchParams.get('id');

  if (isNew) {
    return <AdminExamCreatePage />;
  }

  if (examId) {
    return <AdminExamDetailPage />;
  }

  return <AdminExamListPage />;
};
