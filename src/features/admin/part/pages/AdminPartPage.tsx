import React, { useEffect, useState, useCallback } from 'react';
import { adminPartService } from '../services/adminPartService';
import type { PartResponse, AbilityResponse } from '../types';
import type { PartFormValues, AbilityFormValues } from '../utils/schema';
import { PartList } from '../components/PartList';
import { AbilityList } from '../components/AbilityList';
import { PartFormModal } from '../components/PartFormModal';
import { AbilityFormModal } from '../components/AbilityFormModal';
import { PartAbilityTreeView } from '../components/PartAbilityTreeView';
import { useToast, useConfirm } from '@/core/ui';
import { LayoutGrid, GitBranchPlus } from 'lucide-react';
import '../admin-part.css';

type ViewMode = 'table' | 'tree';

/**
 * Trích xuất message lỗi an toàn từ error kiểu unknown (không dùng any).
 * Ưu tiên lấy response.data.message từ AxiosError, fallback về message mặc định.
 */
function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && 'response' in error) {
    const axiosErr = error as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || fallback;
  }
  return fallback;
}

export const AdminPartPage: React.FC = () => {
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  // Lưu abilities theo partId cho TreeView và hiển thị số lượng trên Part card
  const [abilitiesMap, setAbilitiesMap] = useState<Record<number, AbilityResponse[]>>({});
  
  const [isPartsLoading, setIsPartsLoading] = useState<boolean>(true);
  const [isAbilitiesLoading, setIsAbilitiesLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Modals
  const [selectedPart, setSelectedPart] = useState<PartResponse | null>(null);
  const [isPartModalOpen, setIsPartModalOpen] = useState<boolean>(false);

  const [selectedAbility, setSelectedAbility] = useState<AbilityResponse | null>(null);
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState<boolean>(false);

  // Toast thông báo & Confirm dialog thay thế alert/window.confirm
  const toast = useToast();
  const confirm = useConfirm();

  // Fetch danh sách Parts và đồng thời nạp toàn bộ Abilities để bung cây phân cấp ngay lập tức
  const fetchParts = useCallback(async () => {
    try {
      setIsPartsLoading(true);
      const res = await adminPartService.getParts();
      if (res.success && res.data) {
        setParts(res.data);
        // Tự động chọn part đầu tiên nếu chưa chọn hoặc part đang chọn không còn tồn tại
        setSelectedPartId(prevId => {
          const exists = res.data.some(p => p.id === prevId);
          if (!exists && res.data.length > 0) {
            return res.data[0].id;
          }
          return exists ? prevId : null;
        });

        // Tải trước toàn bộ Năng lực của mọi Part
        const promises = res.data.map(async (part) => {
          try {
            const aRes = await adminPartService.getAbilities(part.id);
            return { partId: part.id, abilities: aRes.data || [] };
          } catch {
            return { partId: part.id, abilities: [] };
          }
        });
        const results = await Promise.all(promises);
        const map: Record<number, AbilityResponse[]> = {};
        results.forEach((r) => {
          map[r.partId] = r.abilities;
        });
        setAbilitiesMap(map);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch parts:', error);
      toast.error(getErrorMessage(error, 'Không thể tải danh sách phần thi.'));
    } finally {
      setIsPartsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  // Fetch Abilities khi selectedPartId thay đổi
  const fetchAbilities = useCallback(async (partId: number) => {
    try {
      setIsAbilitiesLoading(true);
      const res = await adminPartService.getAbilities(partId);
      if (res.success && res.data) {
        setAbilities(res.data);
        // Đồng bộ vào abilitiesMap
        setAbilitiesMap(prev => ({ ...prev, [partId]: res.data }));
      } else {
        setAbilities([]);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch abilities:', error);
      setAbilities([]);
    } finally {
      setIsAbilitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPartId !== null) {
      fetchAbilities(selectedPartId);
    } else {
      setAbilities([]);
    }
  }, [selectedPartId, fetchAbilities]);

  // ===============================
  // PART ACTIONS
  // ===============================
  const handleSelectPart = (id: number) => {
    setSelectedPartId(id);
  };

  const handleAddPart = () => {
    setSelectedPart(null);
    setIsPartModalOpen(true);
  };

  const handleEditPart = (part: PartResponse) => {
    setSelectedPart(part);
    setIsPartModalOpen(true);
  };

  const handleDeletePart = async (id: number) => {
    const ok = await confirm('Bạn có chắc chắn muốn xóa phần thi này không?');
    if (!ok) return;

    try {
      const res = await adminPartService.deletePart(id);
      if (res.success) {
        toast.success('Xóa phần thi thành công.');
        fetchParts();
      }
    } catch (error: unknown) {
      console.error('Delete part failed:', error);
      toast.error(getErrorMessage(error, 'Xóa phần thi thất bại.'));
    }
  };

  const handlePartFormSubmit = async (data: PartFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedPart) {
        await adminPartService.updatePart(selectedPart.id, data);
        toast.success('Cập nhật phần thi thành công.');
      } else {
        const res = await adminPartService.createPart(data);
        toast.success('Tạo phần thi mới thành công.');
        if (res.data?.id) {
          setSelectedPartId(res.data.id);
        }
      }
      setIsPartModalOpen(false);
      fetchParts();
    } catch (error: unknown) {
      console.error('Save part failed:', error);
      toast.error(getErrorMessage(error, 'Lưu dữ liệu phần thi thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===============================
  // ABILITY ACTIONS
  // ===============================
  const handleAddAbility = () => {
    setSelectedAbility(null);
    setIsAbilityModalOpen(true);
  };

  const handleEditAbility = (ability: AbilityResponse) => {
    setSelectedAbility(ability);
    setIsAbilityModalOpen(true);
  };

  const handleDeleteAbility = async (id: number) => {
    const ok = await confirm('Bạn có chắc chắn muốn xóa năng lực này không?');
    if (!ok) return;

    try {
      const res = await adminPartService.deleteAbility(id);
      if (res.success) {
        toast.success('Xóa năng lực thành công.');
        if (selectedPartId) {
          fetchAbilities(selectedPartId);
          // Cập nhật lại abilitiesMap
          setAbilitiesMap(prev => ({
            ...prev,
            [selectedPartId]: (prev[selectedPartId] || []).filter(a => a.id !== id),
          }));
        }
      }
    } catch (error: unknown) {
      console.error('Delete ability failed:', error);
      toast.error(getErrorMessage(error, 'Xóa năng lực thất bại.'));
    }
  };

  const handleAbilityFormSubmit = async (data: AbilityFormValues) => {
    if (!selectedPartId) return;

    try {
      setIsSubmitting(true);
      if (selectedAbility) {
        await adminPartService.updateAbility(selectedAbility.id, data);
        toast.success('Cập nhật năng lực thành công.');
      } else {
        await adminPartService.createAbility(selectedPartId, data);
        toast.success('Tạo năng lực mới thành công.');
      }
      setIsAbilityModalOpen(false);
      fetchAbilities(selectedPartId);
    } catch (error: unknown) {
      console.error('Save ability failed:', error);
      toast.error(getErrorMessage(error, 'Lưu dữ liệu năng lực thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPartObj = parts.find(p => p.id === selectedPartId) || null;
  const selectedPartName = selectedPartObj?.name;

  return (
    <div className="admin-page-container">
      {/* Header chuẩn chung của hệ thống Admin */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Phần thi & Năng lực (Part & Ability)</h1>
          <p className="admin-page-subtitle">Cấu trúc phần thi chuẩn TOEIC và ma trận danh mục năng lực đánh giá tương ứng</p>
        </div>

        {/* Nút chuyển đổi chế độ xem: Bảng quản trị / Cây phân cấp */}
        <div className="admin-segmented-control">
          <button
            type="button"
            className={`segmented-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <LayoutGrid size={15} />
            <span>Quản trị</span>
          </button>
          <button
            type="button"
            className={`segmented-btn ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            <GitBranchPlus size={15} />
            <span>Cây phân cấp</span>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Chế độ 1: Bảng quản trị (CRUD) — layout 2 cột hiện đại */
        <div className="part-layout-grid">
          <div className="part-list-col">
            <PartList 
              parts={parts} 
              abilitiesMap={abilitiesMap}
              selectedPartId={selectedPartId} 
              onSelectPart={handleSelectPart} 
              onAddPart={handleAddPart}
              onEditPart={handleEditPart}
              onDeletePart={handleDeletePart}
              isLoading={isPartsLoading} 
            />
          </div>
          <div className="ability-list-col">
            <AbilityList 
              abilities={abilities}
              isLoading={isAbilitiesLoading}
              selectedPart={selectedPartObj}
              selectedPartName={selectedPartName}
              onAdd={handleAddAbility}
              onEdit={handleEditAbility}
              onDelete={handleDeleteAbility}
            />
          </div>
        </div>
      ) : (
        /* Chế độ 2: Cây phân cấp Part → Ability trực quan toàn màn hình */
        <div className="tree-page-wrapper">
          <PartAbilityTreeView
            parts={parts}
            abilitiesMap={abilitiesMap}
            onLoadAbilities={fetchAbilities}
            isLoading={isPartsLoading}
          />
        </div>
      )}

      {/* Modal Thêm / Sửa Part */}
      <PartFormModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSubmit={handlePartFormSubmit}
        part={selectedPart}
        isLoading={isSubmitting}
      />

      {/* Modal Thêm / Sửa Ability */}
      {selectedPartId && selectedPartName && (
        <AbilityFormModal 
          isOpen={isAbilityModalOpen}
          onClose={() => setIsAbilityModalOpen(false)}
          onSubmit={handleAbilityFormSubmit}
          ability={selectedAbility}
          isLoading={isSubmitting}
          partName={selectedPartName}
        />
      )}
    </div>
  );
};
