import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partThresholdSchema, PartThresholdFormValues } from '../utils/schema';
import type { TargetPartThresholdResponse } from '../types';
import type { PartResponse } from '@/features/admin-part/types';
import type { TargetProfileResponse } from '@/features/admin-target/types';
import { X } from 'lucide-react';

interface PartThresholdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartThresholdFormValues) => void;
  data: TargetPartThresholdResponse | null;
  parts: PartResponse[];
  profiles: TargetProfileResponse[];
  isLoading: boolean;
}

export const PartThresholdFormModal: React.FC<PartThresholdFormModalProps> = ({
  isOpen, onClose, onSubmit, data, parts, profiles, isLoading
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartThresholdFormValues>({
    resolver: zodResolver(partThresholdSchema),
    defaultValues: {
      partId: 0,
      targetProfileId: 0,
      passThreshold: 75,
      confirmThreshold: 50,
      weakThreshold: 30
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          partId: data.partId,
          targetProfileId: data.targetProfileId,
          passThreshold: data.passThreshold,
          confirmThreshold: data.confirmThreshold,
          weakThreshold: data.weakThreshold
        });
      } else {
        reset({
          partId: 0,
          targetProfileId: 0,
          passThreshold: 75,
          confirmThreshold: 50,
          weakThreshold: 30
        });
      }
    }
  }, [isOpen, data, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {data ? 'Sửa Ngưỡng Điểm Part' : 'Thêm Ngưỡng Điểm Part'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part <span className="text-red-500">*</span></label>
              <select
                {...register('partId', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0} disabled>Chọn Part</option>
                {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.partId && <p className="text-red-500 text-xs mt-1">{errors.partId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu (AIM) <span className="text-red-500">*</span></label>
              <select
                {...register('targetProfileId', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0} disabled>Chọn Mục tiêu</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.targetProfileId && <p className="text-red-500 text-xs mt-1">{errors.targetProfileId.message}</p>}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-3 text-sm">Thiết lập Ngưỡng (%)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pass (Qua bài)</label>
                <input
                  type="number"
                  {...register('passThreshold', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
                {errors.passThreshold && <p className="text-red-500 text-xs mt-1">{errors.passThreshold.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm (Cần xác nhận lại)</label>
                <input
                  type="number"
                  {...register('confirmThreshold', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
                {errors.confirmThreshold && <p className="text-red-500 text-xs mt-1">{errors.confirmThreshold.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weak (Yếu)</label>
                <input
                  type="number"
                  {...register('weakThreshold', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
                {errors.weakThreshold && <p className="text-red-500 text-xs mt-1">{errors.weakThreshold.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
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
