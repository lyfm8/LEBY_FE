import React, { useEffect, useState, useCallback } from 'react';
import { adminModuleService } from '../services/adminModuleService';
import type { ModuleResponse, LessonResponse } from '../types';
import type { ModuleFormValues, VideoLessonFormValues, PracticeLessonFormValues } from '../utils/schema';
import { ModuleAccordion } from '../components/ModuleAccordion';
import { ModuleFormModal } from '../components/ModuleFormModal';
import { LessonFormModal } from '../components/LessonFormModal';

export const AdminModulePage: React.FC = () => {
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openModuleIds, setOpenModuleIds] = useState<Set<number>>(new Set());

  // Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleResponse | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminModuleService.getModules();
      if (res.success && res.data) {
        setModules(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const toggleAccordion = (id: number) => {
    setOpenModuleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // ----- MODULE CRUD -----
  const handleAddModule = () => {
    setSelectedModule(null);
    setIsModuleModalOpen(true);
  };

  const handleEditModule = (mod: ModuleResponse) => {
    setSelectedModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleDeleteModule = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Module này? Các bài học bên trong sẽ bị mồ côi hoặc xóa theo tùy CSDL!')) return;
    try {
      const res = await adminModuleService.deleteModule(id);
      if (res.success) fetchModules();
    } catch (error) {
      console.error(error);
      alert('Không thể xóa module (Có thể do đang liên kết khóa học)');
    }
  };

  const handleModuleSubmit = async (data: ModuleFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedModule) {
        await adminModuleService.updateModule(selectedModule.id, data);
      } else {
        await adminModuleService.createModule(data);
      }
      setIsModuleModalOpen(false);
      fetchModules();
    } catch (error) {
      console.error(error);
      alert('Lưu module thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----- LESSON CRUD -----
  const handleAddLesson = (moduleId: number) => {
    setTargetModuleId(moduleId);
    setSelectedLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: LessonResponse, moduleId: number) => {
    setTargetModuleId(moduleId);
    setSelectedLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm('Xóa bài học này?')) return;
    try {
      await adminModuleService.deleteLesson(id);
    } catch (error) {
      console.error(error);
      alert('Lỗi xóa bài học');
    }
  };

  const handleLessonVideoSubmit = async (data: VideoLessonFormValues) => {
    if (!targetModuleId) return;
    try {
      setIsSubmitting(true);
      if (selectedLesson) {
        await adminModuleService.updateLesson(selectedLesson.id, { ...data, lessonType: 'VIDEO' });
      } else {
        await adminModuleService.createVideoLesson(targetModuleId, data);
      }
      setIsLessonModalOpen(false);
      // Buộc refresh lại accordion bằng cách toggle đóng mở hoặc để component con tự xử lý 
      // Ở đây component con sẽ tự gọi api load lại nếu ta refresh nó, tạm đóng mở lại id
      setOpenModuleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetModuleId);
        setTimeout(() => setOpenModuleIds(new Set(newSet).add(targetModuleId)), 100);
        return newSet;
      });
      fetchModules(); // Để update lại tổng số bài học hiển thị ở header
    } catch (error) {
      console.error(error);
      alert('Lưu Video lesson thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLessonPracticeSubmit = async (data: PracticeLessonFormValues) => {
    if (!targetModuleId) return;
    try {
      setIsSubmitting(true);
      if (selectedLesson) {
        await adminModuleService.updateLesson(selectedLesson.id, { ...data, lessonType: 'PRACTICE' });
      } else {
        await adminModuleService.createPracticeLesson(targetModuleId, data);
      }
      setIsLessonModalOpen(false);
      setOpenModuleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetModuleId);
        setTimeout(() => setOpenModuleIds(new Set(newSet).add(targetModuleId)), 100);
        return newSet;
      });
      fetchModules();
    } catch (error) {
      console.error(error);
      alert('Lưu Practice lesson thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Cấu trúc Bài học (Modules)</h1>
          <p className="text-gray-500 mt-1">Sắp xếp và quản lý các Module và Video/Bài tập bên trong</p>
        </div>
        <button
          onClick={handleAddModule}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          + Tạo Module mới
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Đang tải danh sách Modules...</div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
            Chưa có Module nào trong hệ thống.
          </div>
        ) : (
          modules.map(mod => (
            <ModuleAccordion 
              key={mod.id} 
              moduleData={mod} 
              isOpen={openModuleIds.has(mod.id)}
              onToggle={() => toggleAccordion(mod.id)}
              onEditModule={handleEditModule}
              onDeleteModule={handleDeleteModule}
              onAddLesson={handleAddLesson}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
            />
          ))
        )}
      </div>

      <ModuleFormModal 
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSubmit={handleModuleSubmit}
        moduleData={selectedModule}
        isLoading={isSubmitting}
      />

      <LessonFormModal 
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSubmitVideo={handleLessonVideoSubmit}
        onSubmitPractice={handleLessonPracticeSubmit}
        lesson={selectedLesson}
        partId={targetModuleId ? modules.find(m => m.id === targetModuleId)?.partId || null : null}
        isLoading={isSubmitting}
      />
    </div>
  );
};
