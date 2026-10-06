import React, { useEffect, useState, useCallback } from 'react';
import { adminPartService } from '../services/adminPartService';
import type { PartResponse, AbilityResponse } from '../types';
import type { PartFormValues, AbilityFormValues } from '../utils/schema';
import { PartList } from '../components/PartList';
import { AbilityList } from '../components/AbilityList';
import { PartFormModal } from '../components/PartFormModal';
import { AbilityFormModal } from '../components/AbilityFormModal';
import '../admin-part.css';

export const AdminPartPage: React.FC = () => {
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  
  const [isPartsLoading, setIsPartsLoading] = useState<boolean>(true);
  const [isAbilitiesLoading, setIsAbilitiesLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Modals
  const [selectedPart, setSelectedPart] = useState<PartResponse | null>(null);
  const [isPartModalOpen, setIsPartModalOpen] = useState<boolean>(false);

  const [selectedAbility, setSelectedAbility] = useState<AbilityResponse | null>(null);
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState<boolean>(false);

  // Fetch danh sách Parts
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
      }
    } catch (error: any) {
      console.error('Failed to fetch parts:', error);
      const msg = error?.response?.data?.message || 'Không thể tải danh sách phần thi.';
      alert(msg);
    } finally {
      setIsPartsLoading(false);
    }
  }, []);

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
      } else {
        setAbilities([]);
      }
    } catch (error: any) {
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa phần thi này không?')) return;

    try {
      const res = await adminPartService.deletePart(id);
      if (res.success) {
        alert('Xóa phần thi thành công.');
        fetchParts();
      }
    } catch (error: any) {
      console.error('Delete part failed:', error);
      const msg = error?.response?.data?.message || 'Xóa phần thi thất bại.';
      alert(msg);
    }
  };

  const handlePartFormSubmit = async (data: PartFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedPart) {
        await adminPartService.updatePart(selectedPart.id, data);
        alert('Cập nhật phần thi thành công.');
      } else {
        const res = await adminPartService.createPart(data);
        alert('Tạo phần thi mới thành công.');
        if (res.data?.id) {
          setSelectedPartId(res.data.id);
        }
      }
      setIsPartModalOpen(false);
      fetchParts();
    } catch (error: any) {
      console.error('Save part failed:', error);
      const msg = error?.response?.data?.message || 'Lưu dữ liệu phần thi thất bại.';
      alert(msg);
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa năng lực này không?')) return;

    try {
      const res = await adminPartService.deleteAbility(id);
      if (res.success) {
        alert('Xóa năng lực thành công.');
        if (selectedPartId) fetchAbilities(selectedPartId);
      }
    } catch (error: any) {
      console.error('Delete ability failed:', error);
      const msg = error?.response?.data?.message || 'Xóa năng lực thất bại.';
      alert(msg);
    }
  };

  const handleAbilityFormSubmit = async (data: AbilityFormValues) => {
    if (!selectedPartId) return;

    try {
      setIsSubmitting(true);
      if (selectedAbility) {
        await adminPartService.updateAbility(selectedAbility.id, data);
        alert('Cập nhật năng lực thành công.');
      } else {
        await adminPartService.createAbility(selectedPartId, data);
        alert('Tạo năng lực mới thành công.');
      }
      setIsAbilityModalOpen(false);
      fetchAbilities(selectedPartId);
    } catch (error: any) {
      console.error('Save ability failed:', error);
      const msg = error?.response?.data?.message || 'Lưu dữ liệu năng lực thất bại.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPartObj = parts.find(p => p.id === selectedPartId);
  const selectedPartName = selectedPartObj?.name;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Phần thi & Năng lực (Part & Ability)</h1>
          <p className="admin-page-subtitle">Quản lý cấu trúc các phần thi TOEIC và danh mục năng lực đánh giá tương ứng</p>
        </div>
      </div>

      <div className="part-layout-grid">
        {/* Cột trái: Danh sách Part */}
        <div className="part-list-col">
          <PartList 
            parts={parts} 
            selectedPartId={selectedPartId} 
            onSelectPart={handleSelectPart} 
            onAddPart={handleAddPart}
            onEditPart={handleEditPart}
            onDeletePart={handleDeletePart}
            isLoading={isPartsLoading} 
          />
        </div>

        {/* Cột phải: Danh sách Ability của Part được chọn */}
        <div className="ability-list-col">
          <AbilityList 
            abilities={abilities}
            isLoading={isAbilitiesLoading}
            selectedPartName={selectedPartName}
            onAdd={handleAddAbility}
            onEdit={handleEditAbility}
            onDelete={handleDeleteAbility}
          />
        </div>
      </div>

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
