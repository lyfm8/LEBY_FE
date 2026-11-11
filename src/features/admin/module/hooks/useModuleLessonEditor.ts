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
 * Trích xuất message lỗi từ Axios error response (ApiResponse format).
 * Tránh dùng `any` bằng cách kiểm tra cấu trúc an toàn.
 */
const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    if (resp?.data?.message) return resp.data.message;
  }
  return fallback;
};

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
    } catch (error: unknown) {
      console.error('Lỗi lưu Module:', error);
      alert(extractErrorMessage(error, 'Có lỗi xảy ra khi lưu Module!'));
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
    } catch (error: unknown) {
      console.error('Lỗi xóa Module:', error);
      alert(extractErrorMessage(error, 'Không thể xóa Module. Module có thể đang nằm trong lộ trình của học viên!'));
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
    } catch (error: unknown) {
      console.error('Lỗi lưu bài học:', error);
      alert(extractErrorMessage(error, 'Có lỗi xảy ra khi lưu bài học!'));
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Lỗi lưu kịch bản phụ đề:', error);
      alert('Không thể lưu kịch bản phụ đề. Vui lòng kiểm tra lại!');
    }
  };

  /**
   * Sắp xếp lại thứ tự Module bằng cách gửi mảng ID theo thứ tự mới.
   * Gọi API reorder rồi refresh danh sách để đồng bộ sequence từ BE.
   */
  const handleReorderModules = async (orderedIds: number[]) => {
    try {
      await adminModuleService.reorderModules(orderedIds);
      await fetchModules();
    } catch (error: unknown) {
      console.error('Lỗi sắp xếp Module:', error);
      alert('Không thể sắp xếp lại Module!');
    }
  };

  /**
   * Sắp xếp lại thứ tự Lesson trong một Module cụ thể.
   */
  const handleReorderLessons = async (moduleId: number, orderedIds: number[]) => {
    try {
      await adminModuleService.reorderLessons(moduleId, orderedIds);
      await fetchModules();
    } catch (error: unknown) {
      console.error('Lỗi sắp xếp Lesson:', error);
      alert('Không thể sắp xếp lại bài học!');
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
    handleReorderModules,
    handleReorderLessons,
  };
};

