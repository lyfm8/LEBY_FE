import React, { useEffect, useState, useCallback } from 'react';
import { adminThresholdService } from '../services/adminThresholdService';
import { adminPartService } from '@/features/admin-part/services/adminPartService';
import { adminTargetService } from '@/features/admin-target/services/adminTargetService';
import type { TargetPartThresholdResponse, AbilityEvaluationRuleResponse } from '../types';
import type { PartResponse, AbilityResponse } from '@/features/admin-part/types';
import type { TargetProfileResponse } from '@/features/admin-target/types';
import type { PartThresholdFormValues, AbilityRuleFormValues } from '../utils/schema';
import { PartThresholdFormModal } from '../components/PartThresholdFormModal';
import { AbilityRuleFormModal } from '../components/AbilityRuleFormModal';
import { Edit2, Trash2, Plus } from 'lucide-react';

export const AdminThresholdPage: React.FC = () => {
  // Master Data (cho Dropdowns)
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
  const [profiles, setProfiles] = useState<TargetProfileResponse[]>([]);

  // Tables Data
  const [partThresholds, setPartThresholds] = useState<TargetPartThresholdResponse[]>([]);
  const [abilityRules, setAbilityRules] = useState<AbilityEvaluationRuleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [selectedPartRule, setSelectedPartRule] = useState<TargetPartThresholdResponse | null>(null);

  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [selectedAbilityRule, setSelectedAbilityRule] = useState<AbilityEvaluationRuleResponse | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Extract tất cả abilities từ các part (nếu backend chưa có api getAllAbilities riêng)
        const allAbilities = partsRes.data.flatMap(p => p.abilities);
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

  // --- Handlers: Target Part Threshold ---
  const handlePartSubmit = async (data: PartThresholdFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedPartRule) {
        await adminThresholdService.updatePartThreshold(selectedPartRule.id, data);
      } else {
        await adminThresholdService.createPartThreshold(data);
      }
      setIsPartModalOpen(false);
      fetchData(); // reload
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Lỗi khi lưu Part Threshold (Có thể bị trùng)');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // --- Handlers: Ability Evaluation Rule ---
  const handleAbilitySubmit = async (data: AbilityRuleFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedAbilityRule) {
        await adminThresholdService.updateAbilityRule(selectedAbilityRule.id, data);
      } else {
        await adminThresholdService.createAbilityRule(data);
      }
      setIsAbilityModalOpen(false);
      fetchData(); // reload
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Lỗi khi lưu Ability Rule (Mỗi năng lực chỉ được có 1 rule)');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình Ngưỡng & Quy tắc Đánh giá</h1>
        <p className="text-gray-500 mt-1">Quản lý logic phân loại Diagnostic Test và trạng thái Năng lực học viên.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Bảng 1: Target Part Threshold */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-[75vh]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Ngưỡng Diagnostic Test (Part x AIM)</h2>
              <p className="text-xs text-gray-500">Phân luồng học viện theo điểm bài Test</p>
            </div>
            <button 
              onClick={() => { setSelectedPartRule(null); setIsPartModalOpen(true); }}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Thêm Rule
            </button>
          </div>
          <div className="overflow-auto flex-1 p-4">
            {isLoading ? <div className="text-center text-gray-500">Đang tải...</div> : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border-b">Part</th>
                    <th className="p-2 border-b">AIM</th>
                    <th className="p-2 border-b text-center text-green-600 font-semibold">Pass</th>
                    <th className="p-2 border-b text-center text-orange-500 font-semibold">Confirm</th>
                    <th className="p-2 border-b text-center text-red-500 font-semibold">Weak</th>
                    <th className="p-2 border-b w-20 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {partThresholds.map(rule => (
                    <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 font-medium text-gray-700">{rule.partName}</td>
                      <td className="p-2 text-blue-700 font-medium">{rule.aimName}</td>
                      <td className="p-2 text-center font-bold text-gray-700">{rule.passThreshold}%</td>
                      <td className="p-2 text-center font-bold text-gray-700">{rule.confirmThreshold}%</td>
                      <td className="p-2 text-center font-bold text-gray-700">{rule.weakThreshold}%</td>
                      <td className="p-2 flex justify-center gap-2">
                        <button onClick={() => { setSelectedPartRule(rule); setIsPartModalOpen(true); }} className="text-gray-400 hover:text-blue-600"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeletePartRule(rule.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                  {partThresholds.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-6 text-gray-500">Chưa có quy tắc nào</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Bảng 2: Ability Evaluation Rule */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-[75vh]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Quy tắc Đánh giá Năng lực (Ability)</h2>
              <p className="text-xs text-gray-500">Ngưỡng xét trạng thái Stable / Developing / Weak</p>
            </div>
            <button 
              onClick={() => { setSelectedAbilityRule(null); setIsAbilityModalOpen(true); }}
              className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Thêm Rule
            </button>
          </div>
          <div className="overflow-auto flex-1 p-4">
            {isLoading ? <div className="text-center text-gray-500">Đang tải...</div> : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border-b">Năng lực</th>
                    <th className="p-2 border-b text-center text-green-600 font-semibold">Stable</th>
                    <th className="p-2 border-b text-center text-orange-500 font-semibold">Developing</th>
                    <th className="p-2 border-b text-center">Trạng thái</th>
                    <th className="p-2 border-b w-20 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {abilityRules.map(rule => (
                    <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 font-medium text-gray-700">{rule.abilityName}</td>
                      <td className="p-2 text-center font-bold text-gray-700">{rule.stableThreshold}%</td>
                      <td className="p-2 text-center font-bold text-gray-700">{rule.developingThreshold}%</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${rule.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {rule.status}
                        </span>
                      </td>
                      <td className="p-2 flex justify-center gap-2">
                        <button onClick={() => { setSelectedAbilityRule(rule); setIsAbilityModalOpen(true); }} className="text-gray-400 hover:text-blue-600"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteAbilityRule(rule.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                  {abilityRules.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-gray-500">Chưa có quy tắc nào</td></tr>
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
