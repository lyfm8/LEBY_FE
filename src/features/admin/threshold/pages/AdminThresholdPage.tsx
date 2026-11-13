import React from 'react';
import { useThresholdConfig } from '../hooks/useThresholdConfig';
import { AimTabBar } from '../components/AimTabBar';
import { PartThresholdSection } from '../components/PartThresholdSection';
import { AbilityRuleSection } from '../components/AbilityRuleSection';
import { Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import '../admin-threshold.css';

/**
 * Trang quản trị Cấu hình Ngưỡng & Quy tắc Đánh giá (A08 & A10).
 * Luôn hiển thị 2 bảng song song với chuỗi tuần tự trực quan.
 */
export const AdminThresholdPage: React.FC = () => {
  const {
    profiles,
    selectedProfileId,
    selectedProfile,
    setSelectedProfileId,
    partRows,
    abilityRows,
    isLoading,
    isSaving,
    isDirty,
    validationErrors,
    backendErrors,
    successToast,
    updatePartRow,
    updateAbilityRow,
    saveAll,
  } = useThresholdConfig();

  return (
    <div className="admin-threshold-container">
      {/* 1. Header Trang */}
      <header className="threshold-page-header">
        <div className="header-text-block">
          <h1 className="header-main-title">Cấu hình Ngưỡng & Quy tắc Đánh giá</h1>
          <p className="header-sub-title">
            Quản lý logic phân loại Diagnostic Test và trạng thái Năng lực học viên.
          </p>
        </div>

        {/* Nút Lưu cấu hình đưa lên góc phải header */}
        <div className="header-action-wrap">
          {isDirty && (
            <div className="dirty-indicator-pill">
              <span className="pulsing-dot" />
              <span>Có thay đổi chưa lưu</span>
            </div>
          )}
          <button
            type="button"
            className="btn-save-batch"
            onClick={saveAll}
            disabled={isLoading || isSaving}
          >
            <Save size={16} />
            <span>{isSaving ? 'Đang lưu cấu hình...' : 'Lưu cấu hình'}</span>
          </button>
        </div>
      </header>

      {/* 2. Thanh chuyển đổi AIM */}
      <AimTabBar
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={setSelectedProfileId}
      />

      {/* Thông báo lỗi tổng hợp khi bấm Lưu */}
      {backendErrors.length > 0 && (
        <div className="backend-errors-alert">
          <AlertTriangle size={18} className="alert-icon" />
          <div className="alert-content">
            <h4>Không thể lưu cấu hình do vi phạm quy tắc:</h4>
            <ul>
              {backendErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Toast thông báo lưu thành công */}
      {successToast && (
        <div className="success-toast-banner">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* 3. Vùng hiển thị chính: Luôn hiển thị 2 bảng song song */}
      {isLoading ? (
        <div className="threshold-loading-skeleton">
          <div className="loading-spinner" />
          <p>Đang tải dữ liệu cấu hình...</p>
        </div>
      ) : (
        <main className="threshold-main-layout view-always-split">
          <PartThresholdSection
            rows={partRows}
            aimScore={selectedProfile?.aimScore}
            errors={validationErrors}
            onUpdateRow={updatePartRow}
          />

          <AbilityRuleSection
            rows={abilityRows}
            aimScore={selectedProfile?.aimScore}
            errors={validationErrors}
            onUpdateRow={updateAbilityRow}
          />
        </main>
      )}
    </div>
  );
};
