import React from 'react';
import type { TargetProfileResponse } from '@/features/admin/target/types';
import { Target } from 'lucide-react';

interface AimTabBarProps {
  profiles: TargetProfileResponse[];
  selectedProfileId: number | null;
  onSelectProfile: (id: number) => void;
}

export const AimTabBar: React.FC<AimTabBarProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
}) => {
  return (
    <div className="aim-selector-bar">
      <div className="aim-tabs-wrap">
        <span className="aim-selector-label">
          <Target size={16} />
          AIM áp dụng:
        </span>
        <div className="aim-pill-group">
          {profiles.map((profile) => {
            const isActive = profile.id === selectedProfileId;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => onSelectProfile(profile.id)}
                className={`aim-pill-btn ${isActive ? 'is-active' : ''}`}
              >
                AIM {profile.aimScore}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
