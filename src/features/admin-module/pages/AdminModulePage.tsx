import React, { useEffect, useState, useCallback } from 'react';
import { adminModuleService } from '../services/adminModuleService';
import type { ModuleResponse, LessonResponse } from '../types';
import type { ModuleFormValues, VideoLessonFormValues, PracticeLessonFormValues } from '../utils/schema';
import { ModuleAccordion } from '../components/ModuleAccordion';
import { ModuleFormModal } from '../components/ModuleFormModal';
import { LessonFormModal } from '../components/LessonFormModal';
import { ModuleTestModal } from '../components/ModuleTestModal';

/**
 * Container Component xử lý Quản lý Module học tập và Bài học (UC-05).
 * 
 * LƯU Ý KIẾN TRÚC:
 * - Sử dụng kiến trúc Accordion list để hiển thị cây phân cấp (Module -> Lessons).
 * - Component này đóng vai trò Root state, quản lý state đóng/mở của các Accordion
 *   và điều phối các Modal Create/Edit cho cả Module, Lesson và cấu hình Test.
 */
export const AdminModulePage: React.FC = () => {
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Tối ưu UI: Lưu danh sách các Module đang mở bằng Set để handle mở nhiều Module cùng lúc
  const [openModuleIds, setOpenModuleIds] = useState<Set<number>>(new Set());

  // Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleResponse | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<number | null>(null);

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testModuleId, setTestModuleId] = useState<number | null>(null);
  const [testModuleName, setTestModuleName] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Bước 1: Hàm gọi API load danh sách Modules.
   */
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

  /**
   * Xử lý toggle đóng/mở Accordion của một Module cụ thể.
   */
  const toggleAccordion = (id: number) => {
    setOpenModuleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // =====================================
  // MODULE CRUD
  // =====================================

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

  // =====================================
  // LESSON CRUD
  // =====================================

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
      // NOTE: Cần trigger reload lại component con (Accordion) hoặc fetch lại module nếu BE trả về count
    } catch (error) {
      console.error(error);
      alert('Lỗi xóa bài học');
    }
  };

  /**
   * Xử lý Submit lưu Bài học Video.
   */
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
      // Tối ưu: Đóng mở nhanh Accordion để force reload danh sách bài học bên trong
      setOpenModuleIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetModuleId);
        setTimeout(() => setOpenModuleIds(new Set(newSet).add(targetModuleId)), 100);
        return newSet;
      });
      fetchModules(); 
    } catch (error) {
      console.error(error);
      alert('Lưu Video lesson thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Xử lý Submit lưu Bài tập Practice.
   */
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

  // =====================================
  // CẤU HÌNH BÀI KIỂM TRA (MODULE TEST - UC06)
  // =====================================

  const handleConfigTest = (moduleId: number) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      setTestModuleId(moduleId);
      setTestModuleName(mod.title);
      setIsTestModalOpen(true);
    }
  };

  return (
  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Cấu trúc Bài học (Modules)</h1>
          <p className="admin-page-subtitle">Sắp xếp và quản lý các Module và Video/Bài tập bên trong</p>
        </div>
        <button
          onClick={handleAddModule}
          className="btn-primary"
        >
          + Tạo Module mới
        </button>
      </div>

      <div className="accordion-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>Đang tải danh sách Modules...</div>
        ) : modules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px dashed #d1d5db', color: '#6b7280' }}>
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
              onConfigTest={handleConfigTest}
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

      <ModuleTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        moduleId={testModuleId}
        moduleName={testModuleName}
      />
    </div>
  );
};

