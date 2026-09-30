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
import { Pagination } from '@/features/admin/user/components/Pagination';
import '../admin-question.css';

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
      fetchQuestions();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Lưu dữ liệu thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Ngân hàng câu hỏi</h1>
          <p className="admin-page-subtitle">Danh sách câu hỏi dùng chung cho toàn bộ hệ thống</p>
        </div>
      </div>

      <QuestionFilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddNew={handleAddNew}
      />

      <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
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
