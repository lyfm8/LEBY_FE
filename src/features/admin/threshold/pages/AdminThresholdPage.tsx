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
import { Edit2, Trash2, Plus, Grid, Sliders, Layers, CheckCircle, AlertCircle, X, Search, Filter } from 'lucide-react';
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

  // Filter states cho Tab 2 & Tab 3
  const [selectedPartIdForAbilityTab, setSelectedPartIdForAbilityTab] = useState<number | undefined>(undefined);
  const [searchAbilityQuery, setSearchAbilityQuery] = useState('');

  const [selectedPartIdForPartTab, setSelectedPartIdForPartTab] = useState<number | undefined>(undefined);
  const [selectedAimForPartTab, setSelectedAimForPartTab] = useState<number | undefined>(undefined);

  const filteredAbilityRules = React.useMemo(() => {
    return abilityRules.filter(rule => {
      const matchPart = selectedPartIdForAbilityTab ? rule.partId === selectedPartIdForAbilityTab : true;
      const matchQuery = searchAbilityQuery.trim()
        ? rule.abilityName.toLowerCase().includes(searchAbilityQuery.toLowerCase()) ||
          (rule.partName && rule.partName.toLowerCase().includes(searchAbilityQuery.toLowerCase()))
        : true;
      return matchPart && matchQuery;
    });
  }, [abilityRules, selectedPartIdForAbilityTab, searchAbilityQuery]);

  const filteredPartThresholds = React.useMemo(() => {
    return partThresholds.filter(rule => {
      const matchPart = selectedPartIdForPartTab ? rule.partId === selectedPartIdForPartTab : true;
      const matchAim = selectedAimForPartTab ? rule.targetProfileId === selectedAimForPartTab : true;
      return matchPart && matchAim;
    });
  }, [partThresholds, selectedPartIdForPartTab, selectedAimForPartTab]);

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
            Quản trị logic cá nhân hóa: Điểm đỗ bài thi vượt ải theo mục tiêu, quy tắc lọc năng lực nhị phân và ngưỡng điểm phần thi chẩn đoán.
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
          <span>Ma trận Điểm đỗ Mô-đun</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('ability')}
          className={`tab-btn ${currentTab === 'ability' ? 'tab-active' : ''}`}
        >
          <Sliders size={16} />
          <span>Quy tắc Đánh giá Năng lực</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('part')}
          className={`tab-btn ${currentTab === 'part' ? 'tab-active' : ''}`}
        >
          <Layers size={16} />
          <span>Ngưỡng điểm Phần thi Chẩn đoán</span>
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
                <h2 className="table-section-title">Quy tắc Đánh giá Năng lực</h2>
                <p className="table-section-desc">
                  Mô hình 2 ngưỡng cắt nhị phân: Ngưỡng Yếu (&lt; 50%) và Ngưỡng Vững (&ge; 75%).
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

            {/* Thanh công cụ: Lọc Part & Tìm kiếm */}
            <div className="matrix-toolbar">
              <div className="matrix-filters">
                <div className="filter-group">
                  <Filter size={16} className="filter-icon" />
                  <select
                    value={selectedPartIdForAbilityTab ?? ''}
                    onChange={e => setSelectedPartIdForAbilityTab(e.target.value ? Number(e.target.value) : undefined)}
                    className="select-input"
                  >
                    <option value="">Tất cả các Part (Part 1 - 7)</option>
                    {parts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="search-group">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm Năng lực..."
                    value={searchAbilityQuery}
                    onChange={e => setSearchAbilityQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            <div className="threshold-table-wrapper">
              {isLoading ? (
                <div className="matrix-loading-state">
                  <div className="loading-spinner"></div>
                  <p>Đang tải danh sách quy tắc...</p>
                </div>
              ) : filteredAbilityRules.length === 0 ? (
                <div className="matrix-empty-state">
                  <p>Không tìm thấy quy tắc đánh giá Năng lực nào phù hợp</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Năng lực</th>
                      <th style={{ width: '22%' }}>Phần thi</th>
                      <th className="text-center" style={{ width: '14%' }}>Ngưỡng Yếu</th>
                      <th className="text-center" style={{ width: '14%' }}>Ngưỡng Vững</th>
                      <th className="text-center" style={{ width: '12%' }}>Số câu tối thiểu</th>
                      <th className="text-center action-col">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAbilityRules.map(rule => (
                      <tr key={rule.id}>
                        <td className="threshold-primary-cell">{rule.abilityName}</td>
                        <td className="admin-cell-muted">{rule.partName || '-'}</td>
                        <td className="text-center">
                          <span className="badge badge-yellow">
                            &lt; {rule.weakMax}%
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-green">
                            &ge; {rule.stableMin}%
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-gray">
                            {rule.minEvidenceCount} câu
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions-cell is-center">
                            <button
                              type="button"
                              className="admin-btn-action"
                              onClick={() => {
                                setSelectedAbilityRule(rule);
                                setIsAbilityModalOpen(true);
                              }}
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={14} />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              className="admin-btn-action delete"
                              onClick={() => handleDeleteAbilityRule(rule.id)}
                              title="Xóa"
                            >
                              <Trash2 size={14} />
                              <span>Xóa</span>
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
                <h2 className="table-section-title">Ngưỡng điểm Phần thi Chẩn đoán theo Mục tiêu</h2>
                <p className="table-section-desc">
                  Phân luồng 4 nhánh kết quả: Đạt chuẩn, Cận chuẩn, Dưới chuẩn, Mất gốc.
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
                <Plus size={16} /> Thêm Ngưỡng Phần thi
              </button>
            </div>

            {/* Thanh công cụ: Lọc Part & Lọc AIM */}
            <div className="matrix-toolbar">
              <div className="matrix-filters">
                <div className="filter-group">
                  <Filter size={16} className="filter-icon" />
                  <select
                    value={selectedPartIdForPartTab ?? ''}
                    onChange={e => setSelectedPartIdForPartTab(e.target.value ? Number(e.target.value) : undefined)}
                    className="select-input"
                  >
                    <option value="">Tất cả các Part (Part 1 - 7)</option>
                    {parts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <Sliders size={16} className="filter-icon" />
                  <select
                    value={selectedAimForPartTab ?? ''}
                    onChange={e => setSelectedAimForPartTab(e.target.value ? Number(e.target.value) : undefined)}
                    className="select-input"
                  >
                    <option value="">Tất cả mốc AIM</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        AIM {p.aimScore}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="threshold-table-wrapper">
              {isLoading ? (
                <div className="matrix-loading-state">
                  <div className="loading-spinner"></div>
                  <p>Đang tải danh sách ngưỡng Part...</p>
                </div>
              ) : filteredPartThresholds.length === 0 ? (
                <div className="matrix-empty-state">
                  <p>Không tìm thấy cấu hình ngưỡng Part nào phù hợp bộ lọc</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Phần thi</th>
                      <th className="text-center" style={{ width: '15%' }}>Mục tiêu điểm</th>
                      <th className="text-center" style={{ width: '16%' }}>Đạt chuẩn</th>
                      <th className="text-center" style={{ width: '16%' }}>Cận chuẩn</th>
                      <th className="text-center" style={{ width: '16%' }}>Mất gốc</th>
                      <th className="text-center action-col">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartThresholds.map(rule => {
                      const aimNum = rule.targetProfileScore || (rule.targetProfileName?.match(/\d+/)?.[0] ?? rule.targetProfileId);
                      return (
                        <tr key={rule.id}>
                          <td className="threshold-primary-cell">{rule.partName}</td>
                          <td className="text-center">
                            <span className="aim-badge">
                              AIM {aimNum}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-green">
                              &ge; {rule.passScore}%
                            </span>
                          </td>
                          <td className="text-center">
                            {rule.confirmingScore != null ? (
                              <span className="badge badge-blue">
                                &ge; {rule.confirmingScore}%
                              </span>
                            ) : (
                              <span className="admin-cell-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">
                            {rule.fullPartThreshold != null ? (
                              <span className="badge badge-red">
                                &lt; {rule.fullPartThreshold}%
                              </span>
                            ) : (
                              <span className="admin-cell-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="admin-actions-cell is-center">
                              <button
                                type="button"
                                className="admin-btn-action"
                                onClick={() => {
                                  setSelectedPartRule(rule);
                                  setIsPartModalOpen(true);
                                }}
                                title="Chỉnh sửa"
                              >
                                <Edit2 size={14} />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                className="admin-btn-action delete"
                                onClick={() => handleDeletePartRule(rule.id)}
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
