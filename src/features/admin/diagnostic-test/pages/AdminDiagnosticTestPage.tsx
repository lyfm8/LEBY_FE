import React, { useEffect, useState, useCallback } from 'react';
import { adminDiagnosticTestService } from '../services/adminDiagnosticTestService';
import type { DiagnosticTestListItemResponse, DiagnosticTestDetailResponse } from '../types';
import type { DiagnosticTestFormValues } from '../utils/schema';
import { DiagnosticTestFormModal } from '../components/DiagnosticTestFormModal';
import { Edit2, Trash2, Plus, FileText, CheckCircle, XCircle } from 'lucide-react';
import '../admin-diagnostic-test.css';

/**
 * Trang chính quản lý Đề thi chẩn đoán đầu vào (Diagnostic Test).
 * Chức năng: Liệt kê danh sách các đề thi, thêm mới, sửa, xóa đề thi.
 */
export const AdminDiagnosticTestPage: React.FC = () => {
  const [tests, setTests] = useState<DiagnosticTestListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // =====================================
  // MODAL STATE
  // =====================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<DiagnosticTestDetailResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Gọi API lấy danh sách toàn bộ đề thi chẩn đoán (thông tin tóm tắt).
   */
  const fetchTests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminDiagnosticTestService.getAll();
      if (res.success && res.data) {
        setTests(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch diagnostic tests:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // =====================================
  // HANDLERS
  // =====================================

  const handleAdd = () => {
    setSelectedTest(null);
    setIsModalOpen(true);
  };

  /**
   * Khi nhấn sửa, gọi API lấy chi tiết đề thi (bao gồm mảng `questionIds`) để load lên Form Modal.
   */
  const handleEdit = async (id: number) => {
    try {
      // NOTE: Bắt buộc gọi getById vì list API không trả về mảng câu hỏi
      const res = await adminDiagnosticTestService.getById(id);
      if (res.success && res.data) {
        setSelectedTest(res.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      alert('Không thể tải chi tiết đề thi');
    }
  };

  /**
   * Xử lý Xóa đề thi chẩn đoán.
   * LƯU Ý NGHIỆP VỤ: Backend sẽ block xóa nếu đề đã có người làm (DiagnosticAttempt). 
   * Frontend cần hiển thị lỗi rõ ràng từ response của Backend.
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa Đề thi chẩn đoán này? (Sẽ không thể xóa nếu đã có học viên làm bài)')) return;
    try {
      await adminDiagnosticTestService.delete(id);
      fetchTests();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Xóa thất bại. Đã có học viên làm bài thi này.');
    }
  };

  /**
   * Submit lưu dữ liệu vào Backend (Create hoặc Update).
   */
  const handleSubmit = async (data: DiagnosticTestFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedTest) {
        await adminDiagnosticTestService.update(selectedTest.id, data);
      } else {
        await adminDiagnosticTestService.create(data);
      }
      setIsModalOpen(false);
      fetchTests(); // Tải lại danh sách sau khi lưu
    } catch (error) {
      console.error(error);
      alert('Lưu đề thi thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Đề Thi Chẩn Đoán (Diagnostic Test)</h1>
          <p className="admin-page-subtitle">Quản lý các đề thi đầu vào giúp đánh giá và phân loại học viên.</p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary"
        >
          <Plus size={18} /> Tạo Đề Thi Mới
        </button>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#6b7280' }}>Đang tải danh sách...</div>
        ) : tests.length === 0 ? (
          <div className="diagnostic-empty">
            <div className="diagnostic-empty-icon"><FileText size={48} /></div>
            <h3>Chưa có đề thi nào</h3>
            <p>Hãy tạo đề thi chẩn đoán đầu tiên cho học viên.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '4rem' }}>ID</th>
                <th>Tên Đề Thi</th>
                <th style={{ textAlign: 'center' }}>Số lượng Câu hỏi</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'center', width: '7rem' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => (
                <tr key={test.id}>
                  <td className="diagnostic-id">#{test.id}</td>
                  <td>
                    <div className="diagnostic-title">{test.title}</div>
                    <div className="diagnostic-desc" title={test.description}>
                      {test.description || 'Không có mô tả'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-gray">
                      {test.totalQuestions} câu
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {test.status ? (
                      <span className="badge badge-green">
                        <CheckCircle size={14} /> Hoạt động
                      </span>
                    ) : (
                      <span className="badge badge-gray">
                        <XCircle size={14} /> Đã tắt
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <button className="btn-icon primary" onClick={() => handleEdit(test.id)} title="Sửa">
                        <Edit2 size={18} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(test.id)} title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DiagnosticTestFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        data={selectedTest}
        isLoading={isSubmitting}
      />
    </div>
  );
};
