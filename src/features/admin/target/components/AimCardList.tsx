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
    <div style={{ marginBottom: '2rem' }}>
      <div className="aim-list-header">
        <div>
          <h2>Các Mốc Mục Tiêu (AIM)</h2>
          <p>Quản lý các mốc điểm học viên hướng tới</p>
        </div>
        <button
          onClick={onAdd}
          className="btn-primary"
        >
          + Thêm Mục Tiêu
        </button>
      </div>

      <div className="aim-grid">
        {sortedProfiles.map(profile => (
          <div key={profile.id} className="aim-card">
            {/* Hành động */}
            <div className="aim-card-actions">
              <button onClick={() => onEdit(profile)}><Edit2 size={16} /></button>
              <button onClick={() => onDelete(profile.id)}><Trash2 size={16} /></button>
            </div>
            
            <div className="aim-score">{profile.aimScore}</div>
            <div className="aim-desc" title={profile.description}>
              {profile.description || 'Chưa có mô tả'}
            </div>
            
            <div className="aim-users">
              <Users size={16} />
              <span>{profile.totalUsers} học viên</span>
            </div>
          </div>
        ))}

        {sortedProfiles.length === 0 && (
          <div className="aim-empty">
            Chưa có Profile Mục tiêu nào.
          </div>
        )}
      </div>
    </div>
  );
};
