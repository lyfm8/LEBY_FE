import React, { useEffect, useState, useCallback } from 'react';
import { adminDiagnosticTestService } from '../services/adminDiagnosticTestService';
import type { DiagnosticTestListItemResponse, DiagnosticTestDetailResponse } from '../types';
import type { DiagnosticTestFormValues } from '../utils/schema';
import { DiagnosticTestFormModal } from '../components/DiagnosticTestFormModal';
import { Edit2, Trash2, Plus, FileText, CheckCircle, XCircle } from 'lucide-react';

export const AdminDiagnosticTestPage: React.FC = () => {
  const [tests, setTests] = useState<DiagnosticTestListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<DiagnosticTestDetailResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAdd = () => {
    setSelectedTest(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (id: number) => {
    try {
      // Load chi tiết có questionIds
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

  const handleSubmit = async (data: DiagnosticTestFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedTest) {
        await adminDiagnosticTestService.update(selectedTest.id, data);
      } else {
        await adminDiagnosticTestService.create(data);
      }
      setIsModalOpen(false);
      fetchTests();
    } catch (error) {
      console.error(error);
      alert('Lưu đề thi thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đề Thi Chẩn Đoán (Diagnostic Test)</h1>
          <p className="text-gray-500 mt-1">Quản lý các đề thi đầu vào giúp đánh giá và phân loại học viên.</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Tạo Đề Thi Mới
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-3 flex justify-center"><FileText size={48} /></div>
            <h3 className="text-lg font-medium text-gray-800">Chưa có đề thi nào</h3>
            <p className="text-gray-500 mt-1">Hãy tạo đề thi chẩn đoán đầu tiên cho học viên.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 w-16">ID</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Tên Đề Thi</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Số lượng Câu hỏi</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tests.map(test => (
                <tr key={test.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{test.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{test.title}</div>
                    <div className="text-gray-500 text-xs mt-1 truncate max-w-md" title={test.description}>
                      {test.description || 'Không có mô tả'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                      {test.totalQuestions} câu
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {test.status ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2.5 py-1 rounded-md text-xs font-semibold">
                        <CheckCircle size={14} /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-semibold">
                        <XCircle size={14} /> Đã tắt
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEdit(test.id)} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Sửa">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(test.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Xóa">
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
