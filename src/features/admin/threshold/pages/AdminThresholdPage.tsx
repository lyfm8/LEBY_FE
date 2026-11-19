import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminThresholdService } from '../services/adminThresholdService';
import { adminPartService } from '@/features/admin/part/services/adminPartService';
import { adminTargetService } from '@/features/admin/target/services/adminTargetService';
import type {
  TargetPartThresholdResponse,
  AbilityEvaluationRuleResponse,
  ModuleThresholdMatrixResponse,
  ModuleThresholdItemDto,
} from '../types';
import type { PartResponse, AbilityResponse } from '@/features/admin/part/types';
import type { TargetProfileResponse } from '@/features/admin/target/types';
import type { PartThresholdFormValues, AbilityRuleFormValues } from '../utils/schema';
import { ModuleThresholdMatrixTable } from '../components/ModuleThresholdMatrixTable';
import { PartThresholdFormModal } from '../components/PartThresholdFormModal';
import { AbilityRuleFormModal } from '../components/AbilityRuleFormModal';
import { Edit2, Trash2, Plus, Grid, Sliders, Layers, CheckCircle, AlertCircle, X } from 'lucide-react';
import '../admin-threshold.css';

type ActiveTab = 'matrix' | 'ability' | 'part';

/**
 * Trang quản lý cấu hình Ngưỡng (Threshold) & Quy tắc Đánh giá (Evaluation Rule).
 * Bao gồm 3 tab chức năng:
 * 1. Ma trận Điểm đỗ Module (Module Target Threshold): Tùy biến điểm đỗ bài thi vượt ải theo từng AIM.
 * 2. Quy tắc Đánh giá Năng lực (Ability Evaluation Rule): Phân loại nhị phân 2 mốc weakMax (50%) và stableMin (75%).
 * 3. Ngưỡng điểm Part Diagnostic (Target Part Threshold): Phân luồng 4 nhánh theo kết quả thi từng Part.
 */
export const AdminThresholdPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as ActiveTab) || 'matrix';

  // =====================================
  // MASTER DATA STATE
  // =====================================
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
  const [profiles, setProfiles] = useState<TargetProfileResponse[]>([]);

  // =====================================
  // DATA STATE CHO 3 TAB
  // =====================================
  const [matrixData, setMatrixData] = useState<ModuleThresholdMatrixResponse | null>(null);
  const [selectedPartIdForMatrix, setSelectedPartIdForMatrix] = useState<number | undefined>(undefined);
  const [abilityRules, setAbilityRules] = useState<AbilityEvaluationRuleResponse[]>([]);
  const [partThresholds, setPartThresholds] = useState<TargetPartThresholdResponse[]>([]);

  // =====================================
  // LOADING & MODAL & NOTIFICATION STATE
  // =====================================
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dirtyMatrixCount, setDirtyMatrixCount] = useState(0);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      if (axiosErr.response?.data?.message) {
        return axiosErr.response.data.message;
      }
    }
    if (error instanceof Error) return error.message;
    return fallback;
  };

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [selectedPartRule, setSelectedPartRule] = useState<TargetPartThresholdResponse | null>(null);

  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [selectedAbilityRule, setSelectedAbilityRule] = useState<AbilityEvaluationRuleResponse | null>(null);

  // Đồng bộ tab được chọn vào URL search params, cảnh báo nếu có thay đổi chưa lưu
  const handleTabChange = (tab: ActiveTab) => {
    if (currentTab === 'matrix' && dirtyMatrixCount > 0 && tab !== 'matrix') {
      const confirmLeave = window.confirm(
        `Bạn có ${dirtyMatrixCount} ô thay đổi chưa lưu trong Ma trận điểm đỗ. Bạn có chắc chắn muốn chuyển tab không? Các thay đổi chưa lưu sẽ bị mất.`
      );
      if (!confirmLeave) return;
    }
    setDirtyMatrixCount(0);
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      updated.set('tab', tab);
      return updated;
    });
  };

  /**
   * Tải Master Data (Parts, Abilities, Profiles)
   */
  const fetchMasterData = useCallback(async () => {
    try {
      const [partsRes, profRes] = await Promise.all([
        adminPartService.getParts(),
        adminTargetService.getAllProfiles(),
      ]);

      if (partsRes.success && partsRes.data) {
        setParts(partsRes.data);
        const allAbilities = partsRes.data.flatMap(p => p.abilities || []);
        setAbilities(allAbilities);
      }

      if (profRes.success && profRes.data) {
        setProfiles(profRes.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải master data:', error);
    }
  }, []);

  /**
   * Tải dữ liệu Ma trận Điểm đỗ Module (Tab 1)
   */
  const fetchMatrixData = useCallback(async (partId?: number) => {
    setIsLoading(true);
    try {
      const res = await adminThresholdService.getModuleThresholdMatrix(partId);
      if (res.success && res.data) {
        setMatrixData(res.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải ma trận điểm đỗ Module:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Tải dữ liệu Quy tắc Đánh giá Năng lực (Tab 2)
   */
  const fetchAbilityRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminThresholdService.getAbilityRules();
      if (res.success && res.data) {
        setAbilityRules(res.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải quy tắc đánh giá Ability:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Tải dữ liệu Ngưỡng điểm Part Diagnostic (Tab 3)
   */
  const fetchPartThresholds = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminThresholdService.getPartThresholds();
      if (res.success && res.data) {
        setPartThresholds(res.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải ngưỡng điểm Part Diagnostic:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Khởi tạo ban đầu
  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Tải dữ liệu theo Tab hiện tại
  useEffect(() => {
    if (currentTab === 'matrix') {
      fetchMatrixData(selectedPartIdForMatrix);
    } else if (currentTab === 'ability') {
      fetchAbilityRules();
    } else if (currentTab === 'part') {
      fetchPartThresholds();
    }
  }, [currentTab, selectedPartIdForMatrix, fetchMatrixData, fetchAbilityRules, fetchPartThresholds]);

  // =====================================
  // HANDLERS: TAB 1 - MA TRẬN ĐIỂM ĐỖ MODULE
  // =====================================
  const handleSaveBatchMatrix = async (items: ModuleThresholdItemDto[]) => {
    setIsSavingBatch(true);
    try {
      const res = await adminThresholdService.batchUpdateModuleThresholds({ items });
      if (res.success) {
        showToast('success', 'Cập nhật ma trận điểm đỗ thành công!');
        fetchMatrixData(selectedPartIdForMatrix);
      }
    } catch (error: unknown) {
      console.error(error);
      showToast('error', getErrorMessage(error, 'Lỗi khi lưu ma trận điểm đỗ'));
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleResetMatrixCell = async (moduleId: number, profileId: number) => {
    if (!window.confirm('Khôi phục ô này về điểm đỗ mặc định của Module?')) return;
    try {
      await adminThresholdService.resetModuleThreshold(moduleId, profileId);
      showToast('success', 'Khôi phục điểm đỗ mặc định thành công!');
      fetchMatrixData(selectedPartIdForMatrix);
    } catch (error: unknown) {
      console.error(error);
      showToast('error', getErrorMessage(error, 'Khôi phục điểm đỗ thất bại'));
    }
  };

  // =====================================
  // HANDLERS: TAB 2 - ABILITY EVALUATION RULES
  // =====================================
  const handleAbilitySubmit = async (data: AbilityRuleFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedAbilityRule) {
        await adminThresholdService.updateAbilityRule(selectedAbilityRule.id, {
          stableMin: data.stableMin,
          weakMax: data.weakMax,
          minEvidenceCount: data.minEvidenceCount,
        });
        showToast('success', 'Cập nhật quy tắc đánh giá Ability thành công!');
      } else {
        await adminThresholdService.createAbilityRule({
          abilityId: data.abilityId,
          stableMin: data.stableMin,
          weakMax: data.weakMax,
          minEvidenceCount: data.minEvidenceCount,
        });
        showToast('success', 'Tạo mới quy tắc đánh giá Ability thành công!');
      }
      setIsAbilityModalOpen(false);
      fetchAbilityRules();
    } catch (error: unknown) {
      console.error(error);
      showToast('error', getErrorMessage(error, 'Lỗi khi lưu quy tắc đánh giá Ability'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAbilityRule = async (id: number) => {
    if (!window.confirm('Xóa quy tắc đánh giá này?')) return;
    try {
      await adminThresholdService.deleteAbilityRule(id);
      showToast('success', 'Xóa quy tắc đánh giá thành công!');
      fetchAbilityRules();
    } catch (error) {
      console.error(error);
      showToast('error', getErrorMessage(error, 'Xóa quy tắc đánh giá thất bại'));
    }
  };

  // =====================================
  // HANDLERS: TAB 3 - TARGET PART THRESHOLDS
  // =====================================
  const handlePartSubmit = async (data: PartThresholdFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedPartRule) {
        await adminThresholdService.updatePartThreshold(selectedPartRule.id, {
          passScore: data.passScore,
          confirmingScore: data.confirmingScore,
          fullPartThreshold: data.fullPartThreshold,
        });
        showToast('success', 'Cập nhật ngưỡng điểm Part Diagnostic thành công!');
      } else {
        await adminThresholdService.createPartThreshold({
          targetProfileId: data.targetProfileId,
          partId: data.partId,
          passScore: data.passScore,
          confirmingScore: data.confirmingScore,
          fullPartThreshold: data.fullPartThreshold,
        });
        showToast('success', 'Tạo mới ngưỡng điểm Part Diagnostic thành công!');
      }
      setIsPartModalOpen(false);
      fetchPartThresholds();
    } catch (error: unknown) {
      console.error(error);
      showToast('error', getErrorMessage(error, 'Lỗi khi lưu ngưỡng điểm Part Diagnostic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePartRule = async (id: number) => {
    if (!window.confirm('Xóa quy tắc điểm Part này?')) return;
    try {
      await adminThresholdService.deletePartThreshold(id);
      showToast('success', 'Xóa cấu hình ngưỡng điểm Part thành công!');
      fetchPartThresholds();
    } catch (error) {
      console.error(error);
      showToast('error', getErrorMessage(error, 'Xóa ngưỡng điểm Part thất bại'));
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header trang */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cấu hình Ngưỡng & Quy tắc Đánh giá</h1>
          <p className="admin-page-subtitle">
            Quản trị logic cá nhân hóa: Điểm đỗ Module Test theo AIM, Quy tắc lọc Năng lực nhị phân và Ngưỡng điểm Part Diagnostic.
          </p>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div className={`threshold-toast-banner toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="toast-close-btn" aria-label="Đóng thông báo">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs Điều Hướng */}
      <div className="threshold-tabs">
        <button
          type="button"
          onClick={() => handleTabChange('matrix')}
          className={`tab-btn ${currentTab === 'matrix' ? 'tab-active' : ''}`}
        >
          <Grid size={16} />
          <span>Ma trận Điểm đỗ Module (Module x AIM)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('ability')}
          className={`tab-btn ${currentTab === 'ability' ? 'tab-active' : ''}`}
        >
          <Sliders size={16} />
          <span>Quy tắc Đánh giá Năng lực (Ability Rules)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('part')}
          className={`tab-btn ${currentTab === 'part' ? 'tab-active' : ''}`}
        >
          <Layers size={16} />
          <span>Ngưỡng điểm Part Diagnostic (Part x AIM)</span>
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="threshold-tab-content">
        {/* TAB 1: MA TRẬN ĐIỂM ĐỖ MODULE */}
        {currentTab === 'matrix' && (
          <div className="table-container">
            <ModuleThresholdMatrixTable
              data={matrixData}
              parts={parts}
              selectedPartId={selectedPartIdForMatrix}
              onSelectPartId={partId => {
                setSelectedPartIdForMatrix(partId);
                fetchMatrixData(partId);
              }}
              onSaveBatch={handleSaveBatchMatrix}
              onResetCell={handleResetMatrixCell}
              isLoading={isLoading}
              isSaving={isSavingBatch}
              onDirtyCountChange={setDirtyMatrixCount}
            />
          </div>
        )}

        {/* TAB 2: QUY TẮC ĐÁNH GIÁ NĂNG LỰC */}
        {currentTab === 'ability' && (
          <div className="table-container">
            <div className="threshold-table-header">
              <div>
                <h2 className="table-section-title">Quy tắc Đánh giá Năng lực (Ability Evaluation Rules)</h2>
                <p className="table-section-desc">
                  Mô hình 2 ngưỡng cắt nhị phân: weakMax (50% cho nhánh CONFIRM) và stableMin (75% cho nhánh WEAK).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedAbilityRule(null);
                  setIsAbilityModalOpen(true);
                }}
                className="btn-primary"
              >
                <Plus size={16} /> Thêm Quy tắc
              </button>
            </div>

            <div className="threshold-table-wrapper">
              {isLoading ? (
                <div className="matrix-loading-state">
                  <div className="loading-spinner"></div>
                  <p>Đang tải danh sách quy tắc...</p>
                </div>
              ) : abilityRules.length === 0 ? (
                <div className="matrix-empty-state">
                  <p>Chưa có quy tắc đánh giá Năng lực nào</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Năng lực (Ability)</th>
                      <th>Phần thi (Part)</th>
                      <th className="text-center text-amber-600">Ngưỡng Yếu (weakMax)</th>
                      <th className="text-center text-emerald-600">Ngưỡng Vững (stableMin)</th>
                      <th className="text-center">Số câu kiểm chứng</th>
                      <th className="text-center action-col">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abilityRules.map(rule => (
                      <tr key={rule.id}>
                        <td className="font-medium text-gray-900">{rule.abilityName}</td>
                        <td className="text-sm text-gray-500">{rule.partName || '-'}</td>
                        <td className="text-center font-bold text-amber-600">
                          &lt; {rule.weakMax}%
                        </td>
                        <td className="text-center font-bold text-emerald-600">
                          &ge; {rule.stableMin}%
                        </td>
                        <td className="text-center font-mono text-sm">
                          {rule.minEvidenceCount} câu
                        </td>
                        <td>
                          <div className="action-buttons justify-center">
                            <button
                              type="button"
                              className="btn-icon primary"
                              onClick={() => {
                                setSelectedAbilityRule(rule);
                                setIsAbilityModalOpen(true);
                              }}
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon danger"
                              onClick={() => handleDeleteAbilityRule(rule.id)}
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: NGƯỠNG ĐIỂM PART DIAGNOSTIC */}
        {currentTab === 'part' && (
          <div className="table-container">
            <div className="threshold-table-header">
              <div>
                <h2 className="table-section-title">Ngưỡng điểm Part Diagnostic theo AIM</h2>
                <p className="table-section-desc">
                  Phân luồng 4 nhánh kết quả: Đạt chuẩn (PASS), Cận chuẩn (CONFIRM), Dưới chuẩn (WEAK), Mất gốc (FULL_PART).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPartRule(null);
                  setIsPartModalOpen(true);
                }}
                className="btn-primary"
              >
                <Plus size={16} /> Thêm Ngưỡng Part
              </button>
            </div>

            <div className="threshold-table-wrapper">
              {isLoading ? (
                <div className="matrix-loading-state">
                  <div className="loading-spinner"></div>
                  <p>Đang tải danh sách ngưỡng Part...</p>
                </div>
              ) : partThresholds.length === 0 ? (
                <div className="matrix-empty-state">
                  <p>Chưa có cấu hình ngưỡng Part nào</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Phần thi (Part)</th>
                      <th>Mục tiêu (AIM)</th>
                      <th className="text-center text-emerald-600">Đạt chuẩn (Pass)</th>
                      <th className="text-center text-blue-600">Cận chuẩn (Confirm)</th>
                      <th className="text-center text-rose-600">Mất gốc (Full Part)</th>
                      <th className="text-center action-col">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partThresholds.map(rule => (
                      <tr key={rule.id}>
                        <td className="font-medium text-gray-900">{rule.partName}</td>
                        <td className="font-semibold text-brand-orange">
                          {rule.targetProfileName || `AIM ${rule.targetProfileScore}`}
                        </td>
                        <td className="text-center font-bold text-emerald-600">
                          &ge; {rule.passScore}%
                        </td>
                        <td className="text-center font-bold text-blue-600">
                          {rule.confirmingScore != null ? `\u2265 ${rule.confirmingScore}%` : '-'}
                        </td>
                        <td className="text-center font-bold text-rose-600">
                          {rule.fullPartThreshold != null ? `< ${rule.fullPartThreshold}%` : '-'}
                        </td>
                        <td>
                          <div className="action-buttons justify-center">
                            <button
                              type="button"
                              className="btn-icon primary"
                              onClick={() => {
                                setSelectedPartRule(rule);
                                setIsPartModalOpen(true);
                              }}
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon danger"
                              onClick={() => handleDeletePartRule(rule.id)}
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PartThresholdFormModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSubmit={handlePartSubmit}
        data={selectedPartRule}
        parts={parts}
        profiles={profiles}
        isLoading={isSubmitting}
      />

      <AbilityRuleFormModal
        isOpen={isAbilityModalOpen}
        onClose={() => setIsAbilityModalOpen(false)}
        onSubmit={handleAbilitySubmit}
        data={selectedAbilityRule}
        abilities={abilities}
        isLoading={isSubmitting}
      />
    </div>
  );
};
