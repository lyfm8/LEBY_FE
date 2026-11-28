import React from 'react';
import { useTargetProfiles } from '../hooks/useTargetProfiles';
import { useThresholdMatrix } from '../hooks/useThresholdMatrix';
import { AimCardList } from '../components/AimCardList';
import { ThresholdTable } from '../components/ThresholdTable';
import { TargetProfileFormModal } from '../components/TargetProfileFormModal';
import '../admin-target.css';

/**
 * Presentational Container Component: Quản lý Mục Tiêu (Target Profiles) và Ma trận Pass Threshold.
 * Logic được chia tách thành 2 hooks: useTargetProfiles và useThresholdMatrix.
 */
export const AdminTargetPage: React.FC = () => {
  const {
    matrix,
    isLoadingMatrix,
    isUpdatingThreshold,
    fetchMatrix,
    handleUpdateThreshold,
  } = useThresholdMatrix();

  const {
    profiles,
    isLoadingProfiles,
    isModalOpen,
    selectedProfile,
    isSubmittingProfile,
    handleAddProfile,
    handleEditProfile,
    handleCloseModal,
    handleDeleteProfile,
    handleSubmitProfile,
  } = useTargetProfiles({
    onProfileChanged: fetchMatrix,
  });

  return (
    <div className="admin-page-container admin-target-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Mục tiêu & Lộ trình</h1>
        </div>
      </div>

      {isLoadingProfiles ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '2.5rem 0' }}>
          Đang tải cấu hình AIM...
        </div>
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
          <div
            style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '2.5rem 0',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          >
            Đang tải Ma trận Ngưỡng Đỗ...
          </div>
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
        onClose={handleCloseModal}
        onSubmit={handleSubmitProfile}
        profile={selectedProfile}
        isLoading={isSubmittingProfile}
      />
    </div>
  );
};
