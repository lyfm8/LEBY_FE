import React, { useEffect, useState, useCallback } from 'react';
import { adminQuestionService } from '../services/adminQuestionService';
import type { 
  QuestionFilterParams, 
  QuestionListItemResponse, 
  QuestionDetailResponse 
} from '../types';
import type { QuestionFormValues } from '../utils/schema';
import { QuestionFilterBar } from '../components/QuestionFilterBar';
import { QuestionTable } from '../components/QuestionTable';
import { QuestionFormModal } from '../components/QuestionFormModal';
import { Pagination } from '@/features/admin-user/components/Pagination'; // Dùng chung component phân trang với admin-user

export const AdminQuestionPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<QuestionFilterParams>({
    page: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetailResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminQuestionService.getQuestions(filters);
      if (res.success && res.data) {
        setQuestions(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        }
      }
    } catch (error) {
      console.error('Lỗi khi fetch danh sách câu hỏi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleFilterChange = (newFilters: Partial<QuestionFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAddNew = () => {
    setSelectedQuestion(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await adminQuestionService.getById(id);
      if (res.success && res.data) {
        setSelectedQuestion(res.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Không tải được chi tiết câu hỏi:', error);
      alert('Đã xảy ra lỗi khi tải dữ liệu câu hỏi!');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      const res = await adminQuestionService.delete(id);
      if (res.success) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      alert('Không thể xóa câu hỏi này. (Có thể câu hỏi đang được sử dụng ở bài Test)');
    }
  };

  const handleFormSubmit = async (data: QuestionFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Chuyển string JSON từ form thành Object trước khi gửi lên API
      const payload = {
        name: data.name,
        type: data.type,
        difficulty: data.difficulty,
        section: data.section,
        partId: data.partId,
        abilityIds: data.abilityIds,
        descriptions: data.descriptions,
        questionData: JSON.parse(data.questionData),
        correctAnswer: JSON.parse(data.correctAnswer)
      };

      if (selectedQuestion) {
        await adminQuestionService.update(selectedQuestion.id, payload);
      } else {
        await adminQuestionService.create(payload);
      }
      setIsModalOpen(false);
      fetchQuestions(); // Tải lại trang sau khi cập nhật thành công
    } catch (error) {
      console.error('Save failed:', error);
      alert('Lưu dữ liệu thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Ngân hàng câu hỏi</h1>
        <p className="text-gray-500 mt-1">Danh sách câu hỏi dùng chung cho toàn bộ hệ thống</p>
      </div>

      <QuestionFilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddNew={handleAddNew}
      />

      <div className="mb-4 text-sm text-gray-600">
        Hiển thị <strong>{questions.length}</strong> / <strong>{totalItems}</strong> câu hỏi
      </div>

      <QuestionTable 
        questions={questions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <Pagination 
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => handleFilterChange({ page })}
        />
      )}

      {/* Render component modal bên ngoài để tránh re-render khi form gõ */}
      <QuestionFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        question={selectedQuestion}
        isLoading={isSubmitting}
      />
    </div>
  );
};
