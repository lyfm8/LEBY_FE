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
 * Container chính Quản lý Module & Lesson (Use Case A05).
 * Tuân thủ cấu trúc chuẩn admin-page-container và admin-page-header nhất quán với toàn bộ hệ thống LEBY Admin.
 * Bố cục 2 cột (Left Tree 370px - Right Studio 1fr) với chiều cao vừa khít khung nhìn, không tạo thanh cuộn kép.
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
    handleReorderModules,
    handleReorderLessons,
  } = useModuleLessonEditor();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);

  // Tải danh sách Parts & Năng lực chung để phục vụ dropdown
  useEffect(() => {
    adminModuleService
      .getParts()
      .then(async (res: unknown) => {
        const responseData = res as { data?: PartResponse[] | { data?: PartResponse[] } };
        const partList: PartResponse[] = Array.isArray(res)
          ? (res as PartResponse[])
          : Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray((responseData?.data as { data?: PartResponse[] })?.data)
          ? (responseData.data as { data: PartResponse[] }).data
          : [];

        if (partList.length > 0) {
          setParts(partList);
          const allAbilities: AbilityResponse[] = [];
          for (const part of partList) {
            try {
              const abRes: unknown = await adminModuleService.getAbilities(part.id);
              const abResponseData = abRes as { data?: AbilityResponse[] };
              const abList = Array.isArray(abRes)
                ? (abRes as AbilityResponse[])
                : Array.isArray(abResponseData?.data)
                ? abResponseData.data
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
    <div className="admin-page-container">
      {/* 1. Header trang chuẩn mực của LEBY Admin */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Mô-đun & Bài học (Module & Lesson)</h1>
          <p className="admin-page-subtitle">
            Thiết kế lộ trình học tập thích ứng, cấu hình ngưỡng vượt ải và biên soạn nội dung bài giảng đa phương tiện
          </p>
        </div>
      </div>

      {/* 2. Studio Grid 2 cột: Cây danh mục (370px) + Vùng Soạn thảo (1fr) */}
      <div className={`module-studio-grid ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* CỘT TRÁI: CÂY DANH MỤC MÔ-ĐUN */}
        <aside className="studio-tree-col">
          <ModuleTreeView
            modules={modules}
            activeView={activeView}
            onSelectView={navigateView}
            onDeleteModule={handleDeleteModule}
            onDeleteLesson={handleDeleteLesson}
            onReorderModules={handleReorderModules}
            onReorderLessons={handleReorderLessons}
            onRefresh={fetchModules}
            isLoading={isLoading}
            onToggleCollapse={() => setIsSidebarCollapsed(true)}
          />
        </aside>

        {/* Nút mở rộng sidebar khi đang thu gọn */}
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

        {/* CỘT PHẢI: KHU VỰC SOẠN THẢO CHI TIẾT */}
        <section className="studio-editor-col">
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
        </section>
      </div>
    </div>
  );
};
