import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionFormSchema, type QuestionFormValues } from '../utils/schema';
import type { QuestionDetailResponse } from '../types';
import { X, HelpCircle } from 'lucide-react';
import { adminPartService } from '@/features/admin/part/services/adminPartService';
import type { PartResponse, AbilityResponse } from '@/features/admin/part/types';

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

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<QuestionFormValues>({
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

  useEffect(() => {
    if (isOpen) {
      adminPartService.getParts().then(res => {
        if (res.success) setParts(res.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPartId) {
      adminPartService.getAbilities(selectedPartId).then(res => {
        if (res.success) setAbilities(res.data);
      }).catch(console.error);
    } else {
      setAbilities([]);
    }
  }, [selectedPartId]);

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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {question ? 'Chỉnh sửa Câu hỏi' : 'Tạo Câu hỏi mới'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontWeight: 600, color: '#374151', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                Thông tin cơ bản
              </div>
              
              <div className="form-group">
                <label className="form-label">Mã/Tên Câu hỏi *</label>
                <input
                  {...register('name')}
                  className="form-input"
                  placeholder="VD: Q-1001"
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Loại câu hỏi</label>
                  <select {...register('type')} className="form-input">
                    <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</option>
                    <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                    <option value="FILL_IN_BLANK">Điền khuyết</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Độ khó</label>
                  <select {...register('difficulty')} className="form-input">
                    {[1,2,3,4,5].map(l => <option key={l} value={l}>Mức {l}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Kỹ năng</label>
                  <select {...register('section')} className="form-input">
                    <option value="LISTENING">Listening</option>
                    <option value="READING">Reading</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Part *</label>
                  <select {...register('partId')} className="form-input">
                    <option value={0} disabled>-- Chọn Part --</option>
                    {parts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.partId && <p className="form-error">{errors.partId.message}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Năng lực (Abilities) *</label>
                <select
                  multiple
                  {...register('abilityIds')}
                  className="form-input"
                  style={{ minHeight: '100px' }}
                  disabled={abilities.length === 0}
                >
                  {abilities.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Giữ Ctrl (Win) hoặc Cmd (Mac) để chọn nhiều năng lực.</p>
                {errors.abilityIds && <p className="form-error">{errors.abilityIds.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả thêm</label>
                <textarea
                  {...register('descriptions')}
                  rows={2}
                  className="form-textarea"
                  placeholder="Ghi chú thêm về câu hỏi này..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#374151', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                Dữ liệu cấu trúc (JSON) 
                <HelpCircle size={16} color="#9ca3af" title="Chỉnh sửa dữ liệu JSON nguyên thủy" />
              </div>

              <div className="form-group">
                <label className="form-label">Dữ liệu Câu hỏi (questionData) *</label>
                <textarea
                  {...register('questionData')}
                  rows={8}
                  className="form-textarea"
                  style={{ fontFamily: 'monospace', backgroundColor: '#f9fafb' }}
                  spellCheck={false}
                />
                {errors.questionData && <p className="form-error">{errors.questionData.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Đáp án đúng (correctAnswer) *</label>
                <textarea
                  {...register('correctAnswer')}
                  rows={6}
                  className="form-textarea"
                  style={{ fontFamily: 'monospace', backgroundColor: '#f9fafb' }}
                  spellCheck={false}
                />
                {errors.correctAnswer && <p className="form-error">{errors.correctAnswer.message}</p>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Đang lưu...' : (question ? 'Lưu cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
