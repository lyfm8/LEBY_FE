import React from 'react';
import type { TargetProfileResponse } from '../types';
import { Edit2, Trash2, Users } from 'lucide-react';

interface AimCardListProps {
  profiles: TargetProfileResponse[];
  onAdd: () => void;
  onEdit: (profile: TargetProfileResponse) => void;
  onDelete: (id: number) => void;
}

export const AimCardList: React.FC<AimCardListProps> = ({ profiles, onAdd, onEdit, onDelete }) => {
  // Sắp xếp profiles theo aimScore tăng dần để hiển thị logic hơn
  const sortedProfiles = [...profiles].sort((a, b) => a.aimScore - b.aimScore);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Các Mốc Mục Tiêu (AIM)</h2>
          <p className="text-sm text-gray-500">Quản lý các mốc điểm học viên hướng tới</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + Thêm Mục Tiêu
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {sortedProfiles.map(profile => (
          <div key={profile.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative group hover:border-blue-300 transition-colors">
            {/* Hành động */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button onClick={() => onEdit(profile)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
              <button onClick={() => onDelete(profile.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
            
            <div className="text-2xl font-black text-blue-700 mb-1">{profile.aimScore}</div>
            <div className="font-semibold text-gray-800 mb-2">{profile.name}</div>
            <div className="text-xs text-gray-500 line-clamp-2 mb-3 h-8" title={profile.description}>
              {profile.description || 'Chưa có mô tả'}
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-flex w-full">
              <Users size={16} />
              <span className="font-medium">{profile.totalUsers} học viên</span>
            </div>
          </div>
        ))}

        {sortedProfiles.length === 0 && (
          <div className="col-span-full text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-500">
            Chưa có Profile Mục tiêu nào.
          </div>
        )}
      </div>
    </div>
  );
};
