import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionFormSchema, type QuestionFormValues } from '../utils/schema';
import type { QuestionDetailResponse } from '../types';
import { X, HelpCircle } from 'lucide-react';
import { adminPartService } from '@/features/admin-part/services/adminPartService';
import type { PartResponse, AbilityResponse } from '@/features/admin-part/types';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormValues) => void;
  question: QuestionDetailResponse | null;
  isLoading: boolean;
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({ 
  isOpen, onClose, onSubmit, question, isLoading 
}) => {
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      name: '',
      type: 'SINGLE_CHOICE',
      difficulty: 1,
      section: 'LISTENING',
      partId: 0,
      abilityIds: [],
      descriptions: '',
      questionData: '{\n  "text": "Câu hỏi demo",\n  "options": ["A.", "B.", "C.", "D."]\n}',
      correctAnswer: '{\n  "answer": "A"\n}'
    }
  });

  const selectedPartId = watch('partId');

  // Load Parts ban đầu
  useEffect(() => {
    if (isOpen) {
      adminPartService.getParts().then(res => {
        if (res.success) setParts(res.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  // Load Abilities khi partId thay đổi
  useEffect(() => {
    if (selectedPartId) {
      adminPartService.getAbilities(selectedPartId).then(res => {
        if (res.success) setAbilities(res.data);
      }).catch(console.error);
    } else {
      setAbilities([]);
    }
  }, [selectedPartId]);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (question) {
        reset({
          name: question.name,
          type: question.type,
          difficulty: question.difficulty,
          section: question.section,
          partId: question.partId,
          abilityIds: question.abilityIds,
          descriptions: question.descriptions,
          // Chuyển object về chuỗi JSON để hiển thị vào textarea
          questionData: JSON.stringify(question.questionData, null, 2),
          correctAnswer: JSON.stringify(question.correctAnswer, null, 2),
        });
      } else {
        reset({
          name: '',
          type: 'SINGLE_CHOICE',
          difficulty: 1,
          section: 'LISTENING',
          partId: 0,
          abilityIds: [],
          descriptions: '',
          questionData: '{\n  "text": "Câu hỏi demo",\n  "options": ["A.", "B.", "C.", "D."]\n}',
          correctAnswer: '{\n  "answer": "A"\n}'
        });
      }
    }
  }, [isOpen, question, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {question ? 'Chỉnh sửa Câu hỏi' : 'Tạo Câu hỏi mới'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột trái: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Thông tin cơ bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã/Tên Câu hỏi *</label>
              <input
                {...register('name')}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="VD: Q-1001"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
                <select
                  {...register('type')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
                >
                  <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                  <option value="FILL_IN_BLANK">Điền khuyết</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
                <select
                  {...register('difficulty')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
                >
                  {[1,2,3,4,5].map(l => <option key={l} value={l}>Mức {l}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng</label>
                <select
                  {...register('section')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
                >
                  <option value="LISTENING">Listening</option>
                  <option value="READING">Reading</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part *</label>
                <select
                  {...register('partId')}
                  className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.partId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value={0} disabled>-- Chọn Part --</option>
                  {parts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.partId && <p className="text-red-500 text-xs mt-1">{errors.partId.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Năng lực (Abilities) *</label>
              <select
                multiple
                {...register('abilityIds')}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 min-h-[100px] ${errors.abilityIds ? 'border-red-500' : 'border-gray-300'}`}
                disabled={abilities.length === 0}
              >
                {abilities.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Giữ Ctrl (Win) hoặc Cmd (Mac) để chọn nhiều năng lực.</p>
              {errors.abilityIds && <p className="text-red-500 text-xs mt-1">{errors.abilityIds.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
              <textarea
                {...register('descriptions')}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
                placeholder="Ghi chú thêm về câu hỏi này..."
              />
            </div>
          </div>

          {/* Cột phải: Dữ liệu JSON Câu hỏi */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
              Dữ liệu cấu trúc (JSON) 
              <HelpCircle size={16} className="text-gray-400" title="Chỉnh sửa dữ liệu JSON nguyên thủy" />
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dữ liệu Câu hỏi (questionData) *</label>
              <textarea
                {...register('questionData')}
                rows={8}
                className={`w-full p-3 font-mono text-sm border rounded-md focus:ring-blue-500 bg-gray-50 ${errors.questionData ? 'border-red-500' : 'border-gray-300'}`}
                spellCheck={false}
              />
              {errors.questionData && <p className="text-red-500 text-xs mt-1">{errors.questionData.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án đúng (correctAnswer) *</label>
              <textarea
                {...register('correctAnswer')}
                rows={6}
                className={`w-full p-3 font-mono text-sm border rounded-md focus:ring-blue-500 bg-gray-50 ${errors.correctAnswer ? 'border-red-500' : 'border-gray-300'}`}
                spellCheck={false}
              />
              {errors.correctAnswer && <p className="text-red-500 text-xs mt-1">{errors.correctAnswer.message}</p>}
            </div>
          </div>

          {/* Nút Submit (chiếm cả 2 cột ở dưới cùng) */}
          <div className="col-span-1 md:col-span-2 pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : (question ? 'Lưu cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
