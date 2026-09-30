import React, { useEffect, useState, useCallback } from 'react';
import { adminThresholdService } from '../services/adminThresholdService';
import { adminPartService } from '@/features/admin/part/services/adminPartService';
import { adminTargetService } from '@/features/admin/target/services/adminTargetService';
import type { TargetPartThresholdResponse, AbilityEvaluationRuleResponse } from '../types';
import type { PartResponse, AbilityResponse } from '@/features/admin/part/types';
import type { TargetProfileResponse } from '@/features/admin/target/types';
import type { PartThresholdFormValues, AbilityRuleFormValues } from '../utils/schema';
import { PartThresholdFormModal } from '../components/PartThresholdFormModal';
import { AbilityRuleFormModal } from '../components/AbilityRuleFormModal';
import { Edit2, Trash2, Plus } from 'lucide-react';
import '../admin-threshold.css';

/**
 * Trang quản lý cấu hình Ngưỡng (Threshold) & Quy tắc Đánh giá (Evaluation Rule).
 * Bao gồm 2 bảng song song:
 * 1. Target Part Threshold: Ngưỡng điểm số để phân loại (Pass/Confirm/Weak) theo Part và AIM.
 * 2. Ability Evaluation Rule: Quy tắc phân loại năng lực (Stable/Developing/Weak) dựa theo tỷ lệ % hoàn thành.
 */
export const AdminThresholdPage: React.FC = () => {
  // =====================================
  // STATE QUẢN LÝ MASTER DATA (Cho Dropdown)
  // =====================================
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
  const [profiles, setProfiles] = useState<TargetProfileResponse[]>([]);

  // =====================================
  // STATE QUẢN LÝ DỮ LIỆU BẢNG (Tables)
  // =====================================
  const [partThresholds, setPartThresholds] = useState<TargetPartThresholdResponse[]>([]);
  const [abilityRules, setAbilityRules] = useState<AbilityEvaluationRuleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // =====================================
  // STATE QUẢN LÝ MODALS
  // =====================================
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [selectedPartRule, setSelectedPartRule] = useState<TargetPartThresholdResponse | null>(null);

  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [selectedAbilityRule, setSelectedAbilityRule] = useState<AbilityEvaluationRuleResponse | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Bước 1: Fetch song song toàn bộ dữ liệu cần thiết từ Backend.
   * Sử dụng Promise.all để tối ưu hiệu năng gọi API, tránh gọi tuần tự (waterfall).
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ptRes, arRes, partsRes, profRes] = await Promise.all([
        adminThresholdService.getPartThresholds(),
        adminThresholdService.getAbilityRules(),
        adminPartService.getParts(),
        adminTargetService.getAllProfiles()
      ]);
      
      if (ptRes.success && ptRes.data) setPartThresholds(ptRes.data);
      if (arRes.success && arRes.data) setAbilityRules(arRes.data);
      if (partsRes.success && partsRes.data) {
        setParts(partsRes.data);
        // LƯU Ý: Tạm thời extract abilities từ mảng parts vì API hiện tại gộp chung.
        // Backend có trả về field `abilities` bên trong mỗi Part object (UC03).
        const allAbilities = partsRes.data.flatMap(p => p.abilities || []);
        setAbilities(allAbilities);
      }
      if (profRes.success && profRes.data) setProfiles(profRes.data);
      
    } catch (error) {
      console.error('Failed to load threshold data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =====================================
  // HANDLERS: TARGET PART THRESHOLD (Bảng 1)
  // =====================================
  
  /**
   * Xử lý Lưu form Target Part Threshold (Tạo mới hoặc Cập nhật)
   */
  const handlePartSubmit = async (data: PartThresholdFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedPartRule) {
        await adminThresholdService.updatePartThreshold(selectedPartRule.id, data);
      } else {
        await adminThresholdService.createPartThreshold(data);
      }
      setIsPartModalOpen(false);
      fetchData(); // Reload lại cả trang sau khi lưu thành công
    } catch (error: any) {
      console.error(error);
      // Bắt lỗi Unique Constraint từ Backend ném ra
      alert(error?.response?.data?.message || 'Lỗi khi lưu Part Threshold (Có thể bị trùng bộ Part x AIM)');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Xử lý Xóa Target Part Threshold
   */
  const handleDeletePartRule = async (id: number) => {
    if (!window.confirm('Xóa quy tắc này?')) return;
    try {
      await adminThresholdService.deletePartThreshold(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Xóa thất bại');
    }
  };

  // =====================================
  // HANDLERS: ABILITY EVALUATION RULE (Bảng 2)
  // =====================================

  /**
   * Xử lý Lưu form Ability Evaluation Rule
   */
  const handleAbilitySubmit = async (data: AbilityRuleFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedAbilityRule) {
        await adminThresholdService.updateAbilityRule(selectedAbilityRule.id, data);
      } else {
        await adminThresholdService.createAbilityRule(data);
      }
      setIsAbilityModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      // Bắt lỗi Unique Constraint (Mỗi năng lực chỉ 1 rule)
      alert(error?.response?.data?.message || 'Lỗi khi lưu Ability Rule (Mỗi năng lực chỉ được có 1 rule)');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Xử lý Xóa Ability Evaluation Rule
   */
  const handleDeleteAbilityRule = async (id: number) => {
    if (!window.confirm('Xóa quy tắc đánh giá này?')) return;
    try {
      await adminThresholdService.deleteAbilityRule(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Xóa thất bại');
    }
  };


  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cấu hình Ngưỡng & Quy tắc Đánh giá</h1>
          <p className="admin-page-subtitle">Quản lý logic phân loại Diagnostic Test và trạng thái Năng lực học viên.</p>
        </div>
      </div>

      <div className="threshold-grid">
        
        {/* Bảng 1: Target Part Threshold */}
        <div className="table-container" style={{ display: 'flex', flexDirection: 'column', height: '75vh' }}>
          <div className="threshold-table-header">
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#1f2937' }}>Ngưỡng Diagnostic Test (Part x AIM)</h2>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Phân luồng học viện theo điểm bài Test</p>
            </div>
            <button 
              onClick={() => { setSelectedPartRule(null); setIsPartModalOpen(true); }}
              className="btn-primary"
            >
              <Plus size={16} /> Thêm Rule
            </button>
          </div>
          <div className="threshold-table-wrapper" style={{ overflow: 'auto', flex: 1 }}>
            {isLoading ? <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>Đang tải...</div> : (
              <table className="admin-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th>Part</th>
                    <th>AIM</th>
                    <th style={{ textAlign: 'center', color: '#16a34a' }}>Pass</th>
                    <th style={{ textAlign: 'center', color: '#ea580c' }}>Confirm</th>
                    <th style={{ textAlign: 'center', color: '#ef4444' }}>Weak</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {partThresholds.map(rule => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: 500 }}>{rule.partName}</td>
                      <td style={{ fontWeight: 500, color: '#ea580c' }}>{rule.aimName}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rule.passThreshold}%</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rule.confirmThreshold}%</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rule.weakThreshold}%</td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                          <button className="btn-icon primary" onClick={() => { setSelectedPartRule(rule); setIsPartModalOpen(true); }}><Edit2 size={16}/></button>
                          <button className="btn-icon danger" onClick={() => handleDeletePartRule(rule.id)}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {partThresholds.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem 0', color: '#6b7280' }}>Chưa có quy tắc nào</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Bảng 2: Ability Evaluation Rule */}
        <div className="table-container" style={{ display: 'flex', flexDirection: 'column', height: '75vh' }}>
          <div className="threshold-table-header">
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#1f2937' }}>Quy tắc Đánh giá Năng lực (Ability)</h2>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Ngưỡng xét trạng thái Stable / Developing / Weak</p>
            </div>
            <button 
              onClick={() => { setSelectedAbilityRule(null); setIsAbilityModalOpen(true); }}
              className="btn-primary"
            >
              <Plus size={16} /> Thêm Rule
            </button>
          </div>
          <div className="threshold-table-wrapper" style={{ overflow: 'auto', flex: 1 }}>
            {isLoading ? <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>Đang tải...</div> : (
              <table className="admin-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th>Năng lực</th>
                    <th style={{ textAlign: 'center', color: '#16a34a' }}>Stable</th>
                    <th style={{ textAlign: 'center', color: '#ea580c' }}>Developing</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {abilityRules.map(rule => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: 500 }}>{rule.abilityName}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rule.stableThreshold}%</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rule.developingThreshold}%</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${rule.status === 'PUBLISHED' ? 'badge-green' : 'badge-gray'}`}>
                          {rule.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                          <button className="btn-icon primary" onClick={() => { setSelectedAbilityRule(rule); setIsAbilityModalOpen(true); }}><Edit2 size={16}/></button>
                          <button className="btn-icon danger" onClick={() => handleDeleteAbilityRule(rule.id)}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {abilityRules.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem 0', color: '#6b7280' }}>Chưa có quy tắc nào</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

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
