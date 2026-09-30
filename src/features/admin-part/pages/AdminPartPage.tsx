import React, { useEffect, useState, useCallback } from 'react';
import { adminPartService } from '../services/adminPartService';
import type { PartResponse, AbilityResponse } from '../types';
import type { AbilityFormValues } from '../utils/schema';
import { PartList } from '../components/PartList';
import { AbilityList } from '../components/AbilityList';
import { AbilityFormModal } from '../components/AbilityFormModal';

export const AdminPartPage: React.FC = () => {
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  
  const [isPartsLoading, setIsPartsLoading] = useState<boolean>(true);
  const [isAbilitiesLoading, setIsAbilitiesLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [selectedAbility, setSelectedAbility] = useState<AbilityResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch danh sách Parts khi mount
  useEffect(() => {
    let isMounted = true;
    const fetchParts = async () => {
      try {
        setIsPartsLoading(true);
        const res = await adminPartService.getParts();
        if (isMounted && res.success && res.data) {
          setParts(res.data);
          // Tự động chọn part đầu tiên nếu có
          if (res.data.length > 0) {
            setSelectedPartId(res.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch parts:', error);
      } finally {
        if (isMounted) setIsPartsLoading(false);
      }
    };
    fetchParts();
    return () => { isMounted = false; };
  }, []);

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
    } catch (error) {
      console.error('Failed to fetch abilities:', error);
      setAbilities([]);
    } finally {
      setIsAbilitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPartId !== null) {
      fetchAbilities(selectedPartId);
    }
  }, [selectedPartId, fetchAbilities]);

  const handleSelectPart = (id: number) => {
    setSelectedPartId(id);
  };

  const handleAddAbility = () => {
    setSelectedAbility(null);
    setIsModalOpen(true);
  };

  const handleEditAbility = (ability: AbilityResponse) => {
    setSelectedAbility(ability);
    setIsModalOpen(true);
  };

  const handleDeleteAbility = async (id: number, totalQuestions: number) => {
    if (totalQuestions > 0) {
      alert('Không thể xóa năng lực này vì đang có câu hỏi liên kết!');
      return;
    }
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa năng lực này không?')) return;

    try {
      const res = await adminPartService.deleteAbility(id);
      if (res.success) {
        if (selectedPartId) fetchAbilities(selectedPartId);
      }
    } catch (error) {
      console.error('Delete ability failed:', error);
      alert('Xóa năng lực thất bại.');
    }
  };

  const handleFormSubmit = async (data: AbilityFormValues) => {
    if (!selectedPartId) return;

    try {
      setIsSubmitting(true);
      if (selectedAbility) {
        await adminPartService.updateAbility(selectedAbility.id, data);
      } else {
        await adminPartService.createAbility(selectedPartId, data);
      }
      setIsModalOpen(false);
      fetchAbilities(selectedPartId);
    } catch (error) {
      console.error('Save ability failed:', error);
      alert('Lưu dữ liệu thất bại, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPartName = parts.find(p => p.id === selectedPartId)?.name;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Part & Năng lực</h1>
        <p className="text-gray-500 mt-1">Quản lý các loại năng lực cần đánh giá theo từng phần thi (Part) của TOEIC</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
        {/* Cột trái: Danh sách Part */}
        <div className="lg:col-span-1 h-full">
          <PartList 
            parts={parts} 
            selectedPartId={selectedPartId} 
            onSelectPart={handleSelectPart} 
            isLoading={isPartsLoading} 
          />
        </div>

        {/* Cột phải: Danh sách Ability của Part được chọn */}
        <div className="lg:col-span-2 h-full">
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

      {selectedPartId && selectedPartName && (
        <AbilityFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          ability={selectedAbility}
          isLoading={isSubmitting}
          partName={selectedPartName}
        />
      )}
    </div>
  );
};
