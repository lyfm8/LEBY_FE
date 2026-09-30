import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { abilityFormSchema, type AbilityFormValues } from '../utils/schema';
import type { AbilityResponse } from '../types';
import { X } from 'lucide-react';

interface AbilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AbilityFormValues) => void;
  ability: AbilityResponse | null;
  isLoading: boolean;
  partName: string;
}

export const AbilityFormModal: React.FC<AbilityFormModalProps> = ({ 
  isOpen, onClose, onSubmit, ability, isLoading, partName 
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AbilityFormValues>({
    resolver: zodResolver(abilityFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'DRAFT',
    }
  });

  // Reset data mỗi khi mở form
  useEffect(() => {
    if (isOpen) {
      if (ability) {
        reset({
          name: ability.name,
          description: ability.description,
          status: ability.status,
        });
      } else {
        reset({
          name: '',
          description: '',
          status: 'DRAFT',
        });
      }
    }
  }, [isOpen, ability, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {ability ? 'Cập nhật Năng lực' : 'Thêm Năng lực mới'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Thuộc {partName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên năng lực *</label>
            <input
              {...register('name')}
              className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="VD: Identifying Actions"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
            <textarea
              {...register('description')}
              rows={3}
              className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Nhập mô tả cho năng lực này..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              {...register('status')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 bg-white"
            >
              <option value="DRAFT">Bản nháp (DRAFT)</option>
              <option value="PUBLISHED">Xuất bản (PUBLISHED)</option>
              <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : (ability ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
