import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { abilityRuleSchema, AbilityRuleFormValues } from '../utils/schema';
import type { AbilityEvaluationRuleResponse } from '../types';
import type { AbilityResponse } from '@/features/admin-part/types';
import { X } from 'lucide-react';

interface AbilityRuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AbilityRuleFormValues) => void;
  data: AbilityEvaluationRuleResponse | null;
  abilities: AbilityResponse[];
  isLoading: boolean;
}

/**
 * Component Modal Form dùng để thêm mới hoặc sửa Quy tắc đánh giá Năng lực (Ability).
 * 
 * NOTE: Giao diện yêu cầu nhập các ngưỡng % để xếp loại học viên (Stable/Developing/Weak).
 * Zod schema đảm bảo validation: developingThreshold < stableThreshold.
 * Trạng thái DRAFT (Nháp) hay PUBLISHED (Hoạt động) quyết định rule này có được hệ thống áp dụng tính toán hay không.
 * 
 * @param isOpen Trạng thái hiển thị modal
 * @param onClose Hàm đóng modal
 * @param onSubmit Callback khi form validate thành công và click lưu
 * @param data Dữ liệu bản ghi hiện tại (nếu ở mode Edit)
 * @param abilities Danh sách Năng lực (master data) để bind vào dropdown
 * @param isLoading Trạng thái đang call API
 */
export const AbilityRuleFormModal: React.FC<AbilityRuleFormModalProps> = ({
  isOpen, onClose, onSubmit, data, abilities, isLoading
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AbilityRuleFormValues>({
    resolver: zodResolver(abilityRuleSchema),
    defaultValues: {
      abilityId: 0,
      stableThreshold: 80,
      developingThreshold: 50,
      status: 'DRAFT'
    }
  });

  // Tự động load data vào form khi Mở Modal ở chế độ chỉnh sửa, hoặc reset trắng ở chế độ thêm mới.
  React.useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          abilityId: data.abilityId,
          stableThreshold: data.stableThreshold,
          developingThreshold: data.developingThreshold,
          status: data.status
        });
      } else {
        // Mặc định an toàn cho form khi tạo mới
        reset({
          abilityId: 0,
          stableThreshold: 80,
          developingThreshold: 50,
          status: 'DRAFT'
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
            {data ? 'Sửa Quy Tắc Đánh Giá Năng Lực' : 'Thêm Quy Tắc Đánh Giá'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Năng lực (Ability) <span className="text-red-500">*</span></label>
            <select
              {...register('abilityId', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0} disabled>Chọn Năng lực</option>
              {abilities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {errors.abilityId && <p className="text-red-500 text-xs mt-1">{errors.abilityId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái (Status)</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DRAFT">Nháp (DRAFT)</option>
                <option value="PUBLISHED">Hoạt động (PUBLISHED)</option>
              </select>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-100 mt-2">
            <h4 className="font-semibold text-green-800 mb-3 text-sm">Thiết lập Ngưỡng (%)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stable (Ổn định)</label>
                <input
                  type="number"
                  {...register('stableThreshold', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500"
                />
                {errors.stableThreshold && <p className="text-red-500 text-xs mt-1">{errors.stableThreshold.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Developing (Đang phát triển)</label>
                <input
                  type="number"
                  {...register('developingThreshold', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500"
                />
                {errors.developingThreshold && <p className="text-red-500 text-xs mt-1">{errors.developingThreshold.message}</p>}
              </div>
            </div>
            <p className="text-xs text-green-700 mt-3">Lưu ý: Dưới mức Developing sẽ được đánh giá là WEAK (Yếu).</p>
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
