import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { videoLessonFormSchema, practiceLessonFormSchema, type VideoLessonFormValues, type PracticeLessonFormValues } from '../utils/schema';
import type { LessonResponse, LessonType } from '../types';
import { X, Video, PenTool } from 'lucide-react';
import { adminPartService } from '@/features/admin-part/services/adminPartService';
import type { AbilityResponse } from '@/features/admin-part/types';

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVideo: (data: VideoLessonFormValues) => void;
  onSubmitPractice: (data: PracticeLessonFormValues) => void;
  lesson: LessonResponse | null;
  partId: number | null; // Để filter ability phù hợp
  isLoading: boolean;
}

export const LessonFormModal: React.FC<LessonFormModalProps> = ({
  isOpen, onClose, onSubmitVideo, onSubmitPractice, lesson, partId, isLoading
}) => {
  const [tab, setTab] = useState<LessonType>('VIDEO');
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
  
  // Tạm thời cho Question ID input dạng chuỗi phẩy (comma-separated), vì question picker phức tạp sẽ làm sau
  const [questionIdsStr, setQuestionIdsStr] = useState(''); 

  const formVideo = useForm<VideoLessonFormValues>({
    resolver: zodResolver(videoLessonFormSchema),
    defaultValues: { title: '', orderNo: 1, status: 'DRAFT', uri: '', durationSeconds: 0 }
  });

  const formPractice = useForm<PracticeLessonFormValues>({
    resolver: zodResolver(practiceLessonFormSchema),
    defaultValues: { title: '', orderNo: 1, status: 'DRAFT', questionIds: [] }
  });

  useEffect(() => {
    if (isOpen) {
      if (partId) {
        adminPartService.getAbilities(partId).then(res => {
          if (res.success && res.data) setAbilities(res.data);
        }).catch(console.error);
      } else {
        setAbilities([]);
      }

      if (lesson) {
        setTab(lesson.lessonType);
        if (lesson.lessonType === 'VIDEO') {
          formVideo.reset({
            title: lesson.title,
            orderNo: lesson.orderNo,
            status: lesson.status,
            abilityId: lesson.abilityId,
            uri: lesson.uri || '',
            durationSeconds: lesson.durationSeconds || 0,
            descriptions: '',
          });
        } else {
          // Practice
          formPractice.reset({
            title: lesson.title,
            orderNo: lesson.orderNo,
            status: lesson.status,
            abilityId: lesson.abilityId,
            descriptions: '',
            instructions: '',
            questionIds: [], // Không có sẵn trong list response, giả định update thì cần fetch chi tiết, nhưng bài toán này lược bớt
          });
          setQuestionIdsStr('');
        }
      } else {
        // Reset all cho mới
        formVideo.reset({ title: '', orderNo: 1, status: 'DRAFT', uri: '', durationSeconds: 0, abilityId: null });
        formPractice.reset({ title: '', orderNo: 1, status: 'DRAFT', questionIds: [], abilityId: null });
        setQuestionIdsStr('');
      }
    }
  }, [isOpen, lesson, partId, formVideo, formPractice]);

  if (!isOpen) return null;

  const handlePracticeSubmit = (data: PracticeLessonFormValues) => {
    // parse string to array of numbers
    const ids = questionIdsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (ids.length === 0) {
      formPractice.setError('questionIds', { message: 'Vui lòng nhập ít nhất 1 ID câu hỏi hợp lệ' });
      return;
    }
    data.questionIds = ids;
    onSubmitPractice(data);
  };

  const isEdit = !!lesson;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Cập nhật Bài học' : 'Thêm Bài học mới'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection (Chỉ hiện khi Add New) */}
        {!isEdit && (
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
            <button
              style={{
                flex: 1, padding: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', border: 'none', background: 'none',
                ...(tab === 'VIDEO' ? { borderBottom: '2px solid #2563eb', color: '#2563eb', backgroundColor: '#eff6ff' } : { color: '#6b7280' })
              }}
              onClick={() => setTab('VIDEO')}
            >
              <Video size={18} /> Video Lesson
            </button>
            <button
              style={{
                flex: 1, padding: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', border: 'none', background: 'none',
                ...(tab === 'PRACTICE' ? { borderBottom: '2px solid #16a34a', color: '#16a34a', backgroundColor: '#f0fdf4' } : { color: '#6b7280' })
              }}
              onClick={() => setTab('PRACTICE')}
            >
              <PenTool size={18} /> Practice Lesson
            </button>
          </div>
        )}

        <div>
          {tab === 'VIDEO' ? (
            <form onSubmit={formVideo.handleSubmit(onSubmitVideo)}>
              <div className="form-group">
                <label className="form-label">Tên bài học (Video) *</label>
                <input {...formVideo.register('title')} className="form-input" />
                {formVideo.formState.errors.title && <p className="form-error">{formVideo.formState.errors.title.message}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Thứ tự *</label>
                  <input type="number" {...formVideo.register('orderNo')} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select {...formVideo.register('status')} className="form-input">
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Xuất bản</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Năng lực (Ability)</label>
                <select {...formVideo.register('abilityId')} className="form-input">
                  <option value="">-- Không chọn --</option>
                  {abilities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">URL Video *</label>
                  <input {...formVideo.register('uri')} placeholder="https://youtube.com/..." className="form-input" />
                  {formVideo.formState.errors.uri && <p className="form-error">{formVideo.formState.errors.uri.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Thời lượng (giây) *</label>
                  <input type="number" {...formVideo.register('durationSeconds')} className="form-input" />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={isLoading} className="btn-primary">Lưu Video</button>
              </div>
            </form>
          ) : (
            <form onSubmit={formPractice.handleSubmit(handlePracticeSubmit)}>
              <div className="form-group">
                <label className="form-label">Tên bài học (Practice) *</label>
                <input {...formPractice.register('title')} className="form-input" />
                {formPractice.formState.errors.title && <p className="form-error">{formPractice.formState.errors.title.message}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Thứ tự *</label>
                  <input type="number" {...formPractice.register('orderNo')} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select {...formPractice.register('status')} className="form-input">
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Xuất bản</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Năng lực (Ability)</label>
                <select {...formPractice.register('abilityId')} className="form-input">
                  <option value="">-- Không chọn --</option>
                  {abilities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Danh sách ID Câu hỏi * (Cách nhau bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={questionIdsStr} 
                  onChange={e => setQuestionIdsStr(e.target.value)} 
                  placeholder="VD: 1042, 1043, 1045" 
                  className="form-input" 
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Lưu ý: Tạm nhập tay ID câu hỏi, FE sẽ nâng cấp Question Picker sau.</p>
                {formPractice.formState.errors.questionIds && <p className="form-error">{formPractice.formState.errors.questionIds.message}</p>}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ backgroundColor: '#16a34a' }}>Lưu Practice</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
