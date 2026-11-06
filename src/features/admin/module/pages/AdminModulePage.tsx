import React, { useState, useEffect } from 'react';
import { useModuleLessonEditor } from '../hooks/useModuleLessonEditor';
import { ModuleTreeView } from '../components/tree/ModuleTreeView';
import { ModuleEditorView } from '../components/editor/ModuleEditorView';
import { ModuleThresholdsView } from '../components/editor/ModuleThresholdsView';
import { LessonEditorView } from '../components/editor/LessonEditorView';
import { ModuleTestView } from '../components/test/ModuleTestView';
import { adminModuleService } from '../services/adminModuleService';
import type { AbilityResponse, PartResponse } from '@/features/admin/part/types';
import { PanelLeftOpen } from 'lucide-react';
import '../admin-module.css';

/**
 * Container chính Quản lý Module & Lesson (Use Case A05) theo kiến trúc Split-View Studio.
 * Phân chia 2 vùng:
 * - Bên trái (25%): Danh sách Module dạng cây, [+ Thêm Module], [⚙️ Cấu hình thông số].
 * - Bên phải (75%): Vùng Editor linh hoạt chuyển đổi giữa Module Editor, Cấu hình thông số, Lesson Editor và Module Test.
 */
export const AdminModulePage: React.FC = () => {
  const {
    modules,
    isLoading,
    isSubmitting,
    activeView,
    currentLessonDetail,
    fetchModules,
    navigateView,
    handleSaveModule,
    handleDeleteModule,
    handleSaveLesson,
    handleDeleteLesson,
    handleSaveLessonScripts,
  } = useModuleLessonEditor();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);

  // Tải danh sách Parts & Năng lực chung để phục vụ dropdown
  useEffect(() => {
    adminModuleService
      .getParts()
      .then(async (res: any) => {
        const partList: PartResponse[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        if (partList.length > 0) {
          setParts(partList);
          const allAbilities: AbilityResponse[] = [];
          for (const part of partList) {
            try {
              const abRes: any = await adminModuleService.getAbilities(part.id);
              const abList = Array.isArray(abRes)
                ? abRes
                : Array.isArray(abRes?.data)
                ? abRes.data
                : [];
              allAbilities.push(...abList);
            } catch {
              // Bỏ qua lỗi từng part riêng lẻ
            }
          }
          setAbilities(allAbilities);
        }
      })
      .catch((err) => console.warn('Lỗi nạp danh sách Part & Năng lực:', err));
  }, []);

  // Lấy module đang active để truyền props
  const activeModule = modules.find((m) => {
    if (activeView.type === 'MODULE_EDIT' || activeView.type === 'MODULE_TEST') {
      return m.id === activeView.moduleId;
    }
    if (activeView.type === 'LESSON_EDIT' || activeView.type === 'LESSON_CREATE') {
      return m.id === activeView.moduleId;
    }
    return false;
  });

  return (
    <div className={`studio-split-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ======================================================== */}
      {/* 1. CỘT BÊN TRÁI (25%): CÂY DANH MỤC & ĐIỀU HƯỚNG          */}
      {/* ======================================================== */}
      <aside className="studio-left-pane">
        <ModuleTreeView
          modules={modules}
          activeView={activeView}
          onSelectView={navigateView}
          onDeleteModule={handleDeleteModule}
          onDeleteLesson={handleDeleteLesson}
          onRefresh={fetchModules}
          isLoading={isLoading}
          onToggleCollapse={() => setIsSidebarCollapsed(true)}
        />
      </aside>

      {/* Nút mở rộng cột trái khi đang thu gọn (nằm cố định mép trái, không chèn lên Editor) */}
      {isSidebarCollapsed && (
        <button
          type="button"
          className="studio-sidebar-expand-btn"
          onClick={() => setIsSidebarCollapsed(false)}
          title="Mở rộng danh mục mô-đun"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      {/* ======================================================== */}
      {/* 2. CỘT BÊN PHẢI (75%): KHU VỰC EDITOR & CHI TIẾT          */}
      {/* ======================================================== */}
      <main className="studio-right-pane">
        {/* VIEW 1: TẠO MỚI MODULE */}
        {activeView.type === 'MODULE_CREATE' && (
          <ModuleEditorView
            parts={parts}
            onSave={handleSaveModule}
            onCancel={() => navigateView({ type: 'MODULE_CONFIGS' })}
            isSubmitting={isSubmitting}
          />
        )}

        {/* VIEW 2: CHỈNH SỬA MODULE */}
        {activeView.type === 'MODULE_EDIT' && (
          <ModuleEditorView
            moduleId={activeView.moduleId}
            existingModule={activeModule}
            parts={parts}
            onSave={handleSaveModule}
            onCancel={() => navigateView({ type: 'MODULE_CONFIGS' })}
            onDelete={handleDeleteModule}
            isSubmitting={isSubmitting}
          />
        )}

        {/* VIEW 3: CẤU HÌNH THÔNG SỐ MODULES */}
        {activeView.type === 'MODULE_CONFIGS' && (
          <ModuleThresholdsView
            modules={modules}
            onRefresh={fetchModules}
            onEditModule={(id: number) => navigateView({ type: 'MODULE_EDIT', moduleId: id })}
          />
        )}

        {/* VIEW 4: TẠO MỚI HOẶC SỬA LESSON */}
        {(activeView.type === 'LESSON_CREATE' || activeView.type === 'LESSON_EDIT') && (
          <LessonEditorView
            lessonId={activeView.type === 'LESSON_EDIT' ? activeView.lessonId : undefined}
            moduleId={activeView.moduleId}
            moduleTitle={activeModule?.title || 'Mô-đun'}
            existingLesson={activeView.type === 'LESSON_EDIT' ? currentLessonDetail : null}
            abilities={abilities}
            onSaveLesson={handleSaveLesson}
            onSaveScripts={handleSaveLessonScripts}
            onCancel={() =>
              navigateView({ type: 'MODULE_EDIT', moduleId: activeView.moduleId })
            }
            onDeleteLesson={
              activeView.type === 'LESSON_EDIT'
                ? () => handleDeleteLesson(activeView.lessonId, activeView.moduleId)
                : undefined
            }
            isSubmitting={isSubmitting}
          />
        )}

        {/* VIEW 5: MODULE TEST PLACEHOLDER */}
        {activeView.type === 'MODULE_TEST' && (
          <ModuleTestView
            moduleId={activeView.moduleId}
            moduleTitle={activeModule?.title || 'Mô-đun'}
            passScore={activeModule?.defaultPassScore ?? 65}
            requiredCompletionRate={activeModule?.requiredCompletionRate ?? 80}
            onBack={() =>
              navigateView({ type: 'MODULE_EDIT', moduleId: activeView.moduleId })
            }
            onOpenThresholds={() => navigateView({ type: 'MODULE_CONFIGS' })}
          />
        )}
      </main>
    </div>
  );
};
