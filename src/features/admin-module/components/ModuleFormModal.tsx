import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { moduleFormSchema, type ModuleFormValues } from '../utils/schema';
import type { ModuleResponse } from '../types';
import { adminPartService } from '@/features/admin-part/services/adminPartService';
import type { PartResponse } from '@/features/admin-part/types';
import { X } from 'lucide-react';

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormValues) => void;
  moduleData: ModuleResponse | null;
  isLoading: boolean;
}

export const ModuleFormModal: React.FC<ModuleFormModalProps> = ({
  isOpen, onClose, onSubmit, moduleData, isLoading
}) => {
  const [parts, setParts] = useState<PartResponse[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: '',
      type: 'THEORY',
      sequence: 1,
      status: 'DRAFT',
      partId: null,
    }
  });

  useEffect(() => {
    if (isOpen) {
      adminPartService.getParts().then(res => {
        if (res.success && res.data) setParts(res.data);
      }).catch(console.error);

      if (moduleData) {
        reset({
          title: moduleData.title,
          type: moduleData.type,
          sequence: moduleData.sequence,
          status: moduleData.status,
          partId: moduleData.partId,
        });
      } else {
        reset({
          title: '',
          type: 'THEORY',
          sequence: 1,
          status: 'DRAFT',
          partId: null,
        });
      }
    }
  }, [isOpen, moduleData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800">
            {moduleData ? 'Cập nhật Module' : 'Thêm Module mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Module *</label>
            <input
              {...register('title')}
              className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="VD: TOEIC Part 1 Overview"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại Module</label>
              <select
                {...register('type')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
              >
                <option value="THEORY">Lý thuyết (Theory)</option>
                <option value="PRACTICE">Luyện tập (Practice)</option>
                <option value="EXAM">Đề thi (Exam)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị *</label>
              <input
                type="number"
                {...register('sequence')}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.sequence ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part liên kết</label>
              <select
                {...register('partId')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
              >
                <option value="">-- Không chọn --</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                {...register('status')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
              >
                <option value="DRAFT">Bản nháp (DRAFT)</option>
                <option value="PUBLISHED">Xuất bản (PUBLISHED)</option>
                <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
