import { useState, useCallback, useEffect } from 'react';
import type {
  ModuleResponse,
  LessonResponse,
  EditorActiveView,
  CreateModuleRequest,
  CreateLessonRequest,
  LessonScriptDto,
} from '../types';
import { adminModuleService } from '../services/adminModuleService';

/**
 * Custom hook quản lý toàn bộ luồng điều phối trạng thái của trang AdminModulePage.
 * Đảm bảo cơ chế Unsaved Changes Guard khi chuyển đổi giữa các view.
 */
export const useModuleLessonEditor = () => {
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View hiện tại ở khu vực bên phải 75%
  const [activeView, setActiveView] = useState<EditorActiveView>({
    type: 'MODULE_CONFIGS',
  });

  // Cờ đánh dấu form đang có dữ liệu chưa lưu
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);

  // Lesson chi tiết đang được chọn để edit (kèm kịch bản scripts)
  const [currentLessonDetail, setCurrentLessonDetail] = useState<LessonResponse | null>(
    null
  );

  /**
   * Tải toàn bộ danh sách Module kèm Lesson con từ Backend.
   */
  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminModuleService.getModules();
      if (res.success && res.data) {
        setModules(res.data);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách Module:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  /**
   * Tải chi tiết Lesson kèm scripts khi activeView chuyển sang LESSON_EDIT.
   */
  useEffect(() => {
    if (activeView.type === 'LESSON_EDIT') {
      adminModuleService
        .getLessonById(activeView.lessonId)
        .then((res) => {
          if (res.success && res.data) {
            setCurrentLessonDetail(res.data);
          }
        })
        .catch((err) => console.error('Lỗi tải chi tiết bài học:', err));
    } else {
      setCurrentLessonDetail(null);
    }
  }, [activeView]);

  /**
   * Điều hướng chuyển đổi view với Unsaved Changes Guard.
   */
  const navigateView = useCallback(
    (targetView: EditorActiveView) => {
      if (isFormDirty) {
        const confirmLeave = window.confirm(
          'Bạn có thay đổi chưa lưu trong biểu mẫu hiện tại. Bạn có chắc chắn muốn chuyển sang mục khác mà không lưu không?'
        );
        if (!confirmLeave) return;
      }
      setIsFormDirty(false);
      setActiveView(targetView);
    },
    [isFormDirty]
  );

  // =====================================
  // MODULE ACTIONS
  // =====================================

  const handleSaveModule = async (
    data: CreateModuleRequest,
    isEdit: boolean,
    id?: number
  ) => {
    try {
      setIsSubmitting(true);
      if (isEdit && id) {
        const res = await adminModuleService.updateModule(id, data);
        if (res.success) {
          alert('Cập nhật Module thành công!');
          setIsFormDirty(false);
          await fetchModules();
        }
      } else {
        const res = await adminModuleService.createModule(data);
        if (res.success && res.data) {
          alert('Tạo Module mới thành công!');
          setIsFormDirty(false);
          await fetchModules();
          setActiveView({ type: 'MODULE_EDIT', moduleId: res.data.id });
        }
      }
    } catch (error: any) {
      console.error('Lỗi lưu Module:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu Module!';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (id: number) => {
    const confirm = window.confirm(
      'Bạn có chắc chắn muốn xóa Module này? Nếu Module đang có học viên theo học trong lộ trình, hệ thống sẽ chặn xóa để bảo vệ dữ liệu!'
    );
    if (!confirm) return;

    try {
      setIsLoading(true);
      const res = await adminModuleService.deleteModule(id);
      if (res.success) {
        alert('Xóa Module thành công!');
        await fetchModules();
        setActiveView({ type: 'MODULE_CONFIGS' });
      }
    } catch (error: any) {
      console.error('Lỗi xóa Module:', error);
      const msg =
        error.response?.data?.message ||
        'Không thể xóa Module. Module có thể đang nằm trong lộ trình của học viên!';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================
  // LESSON ACTIONS
  // =====================================

  const handleSaveLesson = async (
    data: CreateLessonRequest,
    isEdit: boolean,
    lessonId?: number
  ) => {
    try {
      setIsSubmitting(true);
      if (isEdit && lessonId) {
        const res = await adminModuleService.updateLesson(lessonId, data);
        if (res.success) {
          alert('Cập nhật bài học thành công!');
          setIsFormDirty(false);
          await fetchModules();
          if (res.data) setCurrentLessonDetail(res.data);
        }
      } else if (activeView.type === 'LESSON_CREATE') {
        const res = await adminModuleService.createLesson(activeView.moduleId, data);
        if (res.success && res.data) {
          alert('Tạo bài học mới thành công!');
          setIsFormDirty(false);
          await fetchModules();
          setActiveView({
            type: 'LESSON_EDIT',
            lessonId: res.data.id,
            moduleId: activeView.moduleId,
          });
        }
      }
    } catch (error: any) {
      console.error('Lỗi lưu bài học:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài học!';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number, moduleId: number) => {
    const confirm = window.confirm('Bạn có chắc chắn muốn xóa bài học này?');
    if (!confirm) return;

    try {
      setIsLoading(true);
      const res = await adminModuleService.deleteLesson(lessonId);
      if (res.success) {
        alert('Đã xóa bài học thành công!');
        await fetchModules();
        if (
          activeView.type === 'LESSON_EDIT' &&
          activeView.lessonId === lessonId
        ) {
          setActiveView({ type: 'MODULE_EDIT', moduleId });
        }
      }
    } catch (error: any) {
      console.error('Lỗi xóa bài học:', error);
      alert('Không thể xóa bài học!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLessonScripts = async (
    lessonId: number,
    scripts: LessonScriptDto[]
  ) => {
    try {
      const res = await adminModuleService.saveLessonScripts(lessonId, scripts);
      if (res.success && res.data) {
        alert('Lưu kịch bản phụ đề (Script) thành công!');
        setCurrentLessonDetail(res.data);
      }
    } catch (error: any) {
      console.error('Lỗi lưu kịch bản phụ đề:', error);
      alert('Không thể lưu kịch bản phụ đề. Vui lòng kiểm tra lại!');
    }
  };

  return {
    modules,
    isLoading,
    isSubmitting,
    activeView,
    currentLessonDetail,
    isFormDirty,
    setIsFormDirty,
    fetchModules,
    navigateView,
    handleSaveModule,
    handleDeleteModule,
    handleSaveLesson,
    handleDeleteLesson,
    handleSaveLessonScripts,
  };
};

