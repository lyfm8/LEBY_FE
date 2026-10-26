import React, { useEffect, useState, useCallback } from 'react';
import { adminTargetService } from '../services/adminTargetService';
import type { TargetProfileResponse, ThresholdMatrixResponse } from '../types';
import type { TargetProfileFormValues } from '../utils/schema';
import { AimCardList } from '../components/AimCardList';
import { ThresholdTable } from '../components/ThresholdTable';
import { TargetProfileFormModal } from '../components/TargetProfileFormModal';
import '../admin-target.css';

export const AdminTargetPage: React.FC = () => {
  // State Target Profiles
  const [profiles, setProfiles] = useState<TargetProfileResponse[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // State Threshold Matrix
  const [matrix, setMatrix] = useState<ThresholdMatrixResponse>({ profileIds: [], profileScores: [], rows: [] });
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<TargetProfileResponse | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    try {
      const res = await adminTargetService.getAllProfiles();
      if (res.success && res.data) {
        setProfiles(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch target profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  const fetchMatrix = useCallback(async () => {
    setIsLoadingMatrix(true);
    try {
      const res = await adminTargetService.getThresholdMatrix();
      if (res.success && res.data) {
        setMatrix(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch threshold matrix:', error);
    } finally {
      setIsLoadingMatrix(false);
    }
  }, []);

  useEffect(() => {
    // Load parallel 2 APIs
    fetchProfiles();
    fetchMatrix();
  }, [fetchProfiles, fetchMatrix]);

  // --- Handlers for Profiles ---
  const handleAddProfile = () => {
    setSelectedProfile(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: TargetProfileResponse) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleDeleteProfile = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Target Profile này? Sẽ lỗi nếu học viên đang theo mục tiêu này.')) return;
    try {
      await adminTargetService.deleteProfile(id);
      fetchProfiles();
      fetchMatrix(); // Xóa xong thì update matrix
    } catch (error) {
      console.error(error);
      alert('Không thể xóa Profile này do có dữ liệu liên kết.');
    }
  };

  const handleSubmitProfile = async (data: TargetProfileFormValues) => {
    setIsSubmittingProfile(true);
    try {
      if (selectedProfile) {
        await adminTargetService.updateProfile(selectedProfile.id, data);
      } else {
        await adminTargetService.createProfile(data);
      }
      setIsModalOpen(false);
      fetchProfiles();
      fetchMatrix(); // Thêm/sửa Profile thì cột matrix cũng thay đổi
    } catch (error) {
      console.error(error);
      alert('Lưu Target Profile thất bại');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // --- Handlers for Threshold Matrix ---
  const handleUpdateThreshold = async (moduleId: number, profileId: number, passThreshold: number) => {
    setIsUpdatingThreshold(true);
    try {
      await adminTargetService.batchUpdateThresholds({
        items: [{ moduleId, targetProfileId: profileId, passThreshold }]
      });
      // Tự cập nhật local matrix để UI đổi ngay lập tức khỏi cần load lại API (optimistic update)
      setMatrix(prev => {
        const newRows = [...prev.rows];
        const rowIndex = newRows.findIndex(r => r.moduleId === moduleId);
        if (rowIndex !== -1) {
          newRows[rowIndex] = {
            ...newRows[rowIndex],
            thresholds: {
              ...newRows[rowIndex].thresholds,
              [profileId]: passThreshold
            }
          };
        }
        return { ...prev, rows: newRows };
      });
    } catch (error) {
      console.error('Failed to update threshold:', error);
      alert('Cập nhật Threshold thất bại');
      fetchMatrix(); // Rollback nếu lỗi
    } finally {
      setIsUpdatingThreshold(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Mục Tiêu & Lộ Trình (Target Profiles)</h1>
          <p className="admin-page-subtitle">Quản lý các mốc AIM (450, 550, 650...) và thiết lập ngưỡng Pass Module tương ứng.</p>
        </div>
      </div>

      {isLoadingProfiles ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '2.5rem 0' }}>Đang tải cấu hình AIM...</div>
      ) : (
        <AimCardList 
          profiles={profiles} 
          onAdd={handleAddProfile} 
          onEdit={handleEditProfile}
          onDelete={handleDeleteProfile}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {isLoadingMatrix ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2.5rem 0', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>Đang tải Ma trận Ngưỡng Pass...</div>
        ) : (
          <ThresholdTable 
            matrix={matrix} 
            onUpdateThreshold={handleUpdateThreshold}
            isUpdating={isUpdatingThreshold}
          />
        )}
      </div>

      <TargetProfileFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProfile}
        profile={selectedProfile}
        isLoading={isSubmittingProfile}
      />
    </div>
  );
};
