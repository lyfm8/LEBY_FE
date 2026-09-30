import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { targetProfileSchema, TargetProfileFormValues } from '../utils/schema';
import type { TargetProfileResponse } from '../types';
import { X } from 'lucide-react';

interface TargetProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TargetProfileFormValues) => void;
  profile: TargetProfileResponse | null;
  isLoading: boolean;
}

export const TargetProfileFormModal: React.FC<TargetProfileFormModalProps> = ({
  isOpen, onClose, onSubmit, profile, isLoading
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TargetProfileFormValues>({
    resolver: zodResolver(targetProfileSchema),
    defaultValues: {
      name: '',
      aimScore: 0,
      description: ''
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      if (profile) {
        reset({
          name: profile.name,
          aimScore: profile.aimScore,
          description: profile.description || ''
        });
      } else {
        reset({
          name: '',
          aimScore: 0,
          description: ''
        });
      }
    }
  }, [isOpen, profile, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {profile ? 'Sửa Mục Tiêu' : 'Thêm Mục Tiêu Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên mục tiêu <span className="text-red-500">*</span></label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="VD: Đột phá 650"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm Aim <span className="text-red-500">*</span></label>
            <input
              type="number"
              {...register('aimScore', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="VD: 650"
            />
            {errors.aimScore && <p className="text-red-500 text-xs mt-1">{errors.aimScore.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả cho mục tiêu này..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
