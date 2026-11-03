import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lessonFormSchema, type LessonFormValues } from '../utils/schema';
import type { LessonResponse } from '../types';
import { X, BookOpen } from 'lucide-react';
import { adminPartService } from '@/features/admin/part/services/adminPartService';
import type { AbilityResponse } from '@/features/admin/part/types';

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormValues) => void;
  lesson: LessonResponse | null;
  partId: number | null;
  isLoading: boolean;
}

export const LessonFormModal: React.FC<LessonFormModalProps> = ({
  isOpen, onClose, onSubmit, lesson, partId, isLoading
}) => {
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      orderNo: 1,
      status: 'DRAFT',
      abilityId: null,
      descriptions: '',
      audioUrl: '',
      videoUrl: '',
      imageUrl: '',
    },
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
        form.reset({
          title: lesson.title,
          orderNo: lesson.orderNo,
          status: lesson.status,
          abilityId: lesson.abilityId,
          descriptions: lesson.descriptions || '',
          audioUrl: lesson.audioUrl || '',
          videoUrl: lesson.videoUrl || '',
          imageUrl: lesson.imageUrl || '',
        });
      } else {
        form.reset({
          title: '',
          orderNo: 1,
          status: 'DRAFT',
          abilityId: null,
          descriptions: '',
          audioUrl: '',
          videoUrl: '',
          imageUrl: '',
        });
      }
    }
  }, [isOpen, lesson, partId, form]);

  if (!isOpen) return null;

  const isEdit = !!lesson;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} className="text-primary-600" />
            <h2 className="modal-title">
              {isEdit ? 'Cập nhật Bài học' : 'Thêm Bài học mới'}
            </h2>
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên bài học *</label>
            <input {...form.register('title')} className="form-input" placeholder="VD: Chiến lược bắt keyword Part 3" />
            {form.formState.errors.title && <p className="form-error">{form.formState.errors.title.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Thứ tự *</label>
              <input type="number" {...form.register('orderNo', { valueAsNumber: true })} className="form-input" />
              {form.formState.errors.orderNo && <p className="form-error">{form.formState.errors.orderNo.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select {...form.register('status')} className="form-input">
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Xuất bản</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Năng lực đo lường (Ability)</label>
            <select 
              {...form.register('abilityId', { 
                setValueAs: v => (v === '' || v === null ? null : Number(v)) 
              })} 
              className="form-input"
            >
              <option value="">-- Không chọn --</option>
              {abilities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Audio URL (Âm thanh bài giảng / luyện nghe)</label>
            <input {...form.register('audioUrl')} placeholder="https://..." className="form-input" />
            {form.formState.errors.audioUrl && <p className="form-error">{form.formState.errors.audioUrl.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Video URL (Video bài giảng)</label>
            <input {...form.register('videoUrl')} placeholder="https://..." className="form-input" />
            {form.formState.errors.videoUrl && <p className="form-error">{form.formState.errors.videoUrl.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (Hình ảnh minh họa / sơ đồ)</label>
            <input {...form.register('imageUrl')} placeholder="https://..." className="form-input" />
            {form.formState.errors.imageUrl && <p className="form-error">{form.formState.errors.imageUrl.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả / Hướng dẫn bài học</label>
            <textarea {...form.register('descriptions')} rows={3} className="form-input" placeholder="Tóm tắt nội dung bài học..." />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isEdit ? 'Cập nhật' : 'Lưu bài học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
