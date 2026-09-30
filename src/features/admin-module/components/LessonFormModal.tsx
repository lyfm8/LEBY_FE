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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? 'Cập nhật Bài học' : 'Thêm Bài học mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection (Chỉ hiện khi Add New) */}
        {!isEdit && (
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'VIDEO' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setTab('VIDEO')}
            >
              <Video size={18} /> Video Lesson
            </button>
            <button
              className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 transition-colors ${tab === 'PRACTICE' ? 'border-b-2 border-green-600 text-green-600 bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setTab('PRACTICE')}
            >
              <PenTool size={18} /> Practice Lesson
            </button>
          </div>
        )}

        <div className="p-6">
          {tab === 'VIDEO' ? (
            <form onSubmit={formVideo.handleSubmit(onSubmitVideo)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học (Video) *</label>
                <input {...formVideo.register('title')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                {formVideo.formState.errors.title && <p className="text-red-500 text-xs mt-1">{formVideo.formState.errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự *</label>
                  <input type="number" {...formVideo.register('orderNo')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select {...formVideo.register('status')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500">
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Xuất bản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Năng lực (Ability)</label>
                <select {...formVideo.register('abilityId')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500">
                  <option value="">-- Không chọn --</option>
                  {abilities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Video *</label>
                  <input {...formVideo.register('uri')} placeholder="https://youtube.com/..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                  {formVideo.formState.errors.uri && <p className="text-red-500 text-xs mt-1">{formVideo.formState.errors.uri.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (giây) *</label>
                  <input type="number" {...formVideo.register('durationSeconds')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium">Hủy</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium">Lưu Video</button>
              </div>
            </form>
          ) : (
            <form onSubmit={formPractice.handleSubmit(handlePracticeSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học (Practice) *</label>
                <input {...formPractice.register('title')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                {formPractice.formState.errors.title && <p className="text-red-500 text-xs mt-1">{formPractice.formState.errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự *</label>
                  <input type="number" {...formPractice.register('orderNo')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select {...formPractice.register('status')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500">
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Xuất bản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Năng lực (Ability)</label>
                <select {...formPractice.register('abilityId')} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500">
                  <option value="">-- Không chọn --</option>
                  {abilities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách ID Câu hỏi * (Cách nhau bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={questionIdsStr} 
                  onChange={e => setQuestionIdsStr(e.target.value)} 
                  placeholder="VD: 1042, 1043, 1045" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500" 
                />
                <p className="text-xs text-gray-500 mt-1">Lưu ý: Tạm nhập tay ID câu hỏi, FE sẽ nâng cấp Question Picker sau.</p>
                {formPractice.formState.errors.questionIds && <p className="text-red-500 text-xs mt-1">{formPractice.formState.errors.questionIds.message}</p>}
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium">Hủy</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded-md font-medium">Lưu Practice</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
