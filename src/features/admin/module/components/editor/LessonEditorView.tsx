import React, { useState, useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lessonFormSchema, type LessonFormValues } from '../../utils/schema';
import type { LessonResponse, CreateLessonRequest, PracticeQuestionItemDto } from '../../types';
import type { AbilityResponse, PartResponse } from '@/features/admin/part/types';
import { LessonContentTab } from './LessonContentTab';
import { LessonReviewQuestionsTab } from './LessonReviewQuestionsTab';
import {
  BookOpen,
  FileQuestion,
  Save,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/core/ui';

interface LessonEditorViewProps {
  lessonId?: number;
  moduleId: number;
  moduleTitle?: string;
  modulePartId?: number | null;
  moduleAbilityIds?: number[];
  existingLesson?: LessonResponse | null;
  parts: PartResponse[];
  abilities: AbilityResponse[];
  onSaveLesson: (data: CreateLessonRequest, isEdit: boolean, id?: number) => Promise<void>;
  onSavePracticeQuestions: (lessonId: number, items: PracticeQuestionItemDto[]) => Promise<void>;
  onCancel: () => void;
  onDeleteLesson?: (id: number) => void;
  isSubmitting: boolean;
}

type TabType = 'CONTENT' | 'QUESTIONS';

export const LessonEditorView: React.FC<LessonEditorViewProps> = ({
  lessonId,
  moduleTitle,
  modulePartId,
  moduleAbilityIds = [],
  existingLesson,
  parts,
  abilities,
  onSaveLesson,
  onSavePracticeQuestions,
  onCancel,
  onDeleteLesson,
  isSubmitting,
}) => {
  const isEdit = !!lessonId && !!existingLesson;
  const [activeTab, setActiveTab] = useState<TabType>('CONTENT');
  // Cờ trạng thái đang lưu bộ câu hỏi luyện tập
  const [isSavingQuestions, setIsSavingQuestions] = useState<boolean>(false);
  const toast = useToast();

  const form = useForm<LessonFormValues>({
    // NOTE: Type assertion bắt buộc do Zod v4 + @hookform/resolvers v5 có mismatch type giữa input/output schema
    resolver: zodResolver(lessonFormSchema) as unknown as Resolver<LessonFormValues>,
    defaultValues: {
      title: '',
      orderNo: 1,
      status: 'DRAFT',
      lessonType: 'VIDEO',
      durationSeconds: 0,
      abilityId: null,
      isFree: true,
      descriptions: '',
      audioUrl: '',
      videoUrl: '',
      imageUrl: '',
    },
  });

  const { reset, handleSubmit, watch, setValue } = form;

  // Nạp dữ liệu khi edit hoặc reset khi tạo mới
  useEffect(() => {
    if (isEdit && existingLesson) {
      reset({
        title: existingLesson.title,
        orderNo: existingLesson.orderNo,
        status: existingLesson.status,
        lessonType: existingLesson.lessonType || 'VIDEO',
        durationSeconds: existingLesson.durationSeconds ?? 0,
        abilityId: existingLesson.abilityId,
        isFree: existingLesson.isFree ?? true,
        descriptions: existingLesson.descriptions || '',
        audioUrl: existingLesson.audioUrl || '',
        videoUrl: existingLesson.videoUrl || '',
        imageUrl: existingLesson.imageUrl || '',
      });
    } else {
      reset({
        title: '',
        orderNo: 1,
        status: 'DRAFT',
        lessonType: 'VIDEO',
        durationSeconds: 0,
        abilityId: null,
        isFree: true,
        descriptions: '',
        audioUrl: '',
        videoUrl: '',
        imageUrl: '',
      });
    }
  }, [isEdit, existingLesson, reset]);

  const handleFormSubmit = async (values: LessonFormValues) => {
    const payload: CreateLessonRequest = {
      title: values.title.trim(),
      orderNo: values.orderNo,
      status: values.status,
      lessonType: values.lessonType,
      durationSeconds: values.durationSeconds ?? 0,
      abilityId: values.abilityId || null,
      isFree: values.isFree ?? true,
      descriptions: values.descriptions || '',
      audioUrl: values.audioUrl || '',
      videoUrl: values.videoUrl || '',
      imageUrl: values.imageUrl || '',
    };
    await onSaveLesson(payload, isEdit, lessonId);
  };

  /**
   * Wrapper lưu bộ câu hỏi luyện tập kèm quản lý trạng thái loading cục bộ.
   */
  const handleSavePracticeQuestionsLocal = async (items: PracticeQuestionItemDto[]) => {
    // Chặn lưu nếu bài học chưa được khởi tạo trên DB
    if (!lessonId) {
      toast.error('Vui lòng lưu bài học trước khi gắn câu hỏi luyện tập.');
      return;
    }
    // Bật trạng thái loading cho nút Lưu
    setIsSavingQuestions(true);
    try {
      // Gọi callback lưu lên useModuleLessonEditor
      await onSavePracticeQuestions(lessonId, items);
    } finally {
      // Tắt trạng thái loading sau khi hoàn tất
      setIsSavingQuestions(false);
    }
  };

  const currentStatus = watch('status');
  // Theo dõi loại bài học hiện tại (VIDEO hoặc PRACTICE)
  const currentLessonType = watch('lessonType');
  // Lấy thông tin Part hiện tại để suy ra section (LISTENING/READING) dự phòng nếu existingLesson chưa có
  const resolvedPartId = existingLesson?.partId ?? modulePartId ?? null;
  const resolvedPart = parts.find((p) => p.id === resolvedPartId);
  const resolvedSection = existingLesson?.section ?? (resolvedPart?.sections as 'LISTENING' | 'READING' | undefined) ?? null;
  const practiceQuestionsList = existingLesson?.practiceQuestions ?? [];

  // Siết phân cấp Ability: chỉ hiển thị các Ability thuộc mô-đun hiện tại (fallback theo Part nếu mô-đun chưa chọn Ability)
  const scopedAbilities = useMemo(() => {
    if (moduleAbilityIds.length > 0) {
      return abilities.filter((ab) => moduleAbilityIds.includes(ab.id));
    }
    if (resolvedPartId) {
      return abilities.filter((ab) => ab.partId === resolvedPartId);
    }
    return abilities;
  }, [abilities, moduleAbilityIds, resolvedPartId]);

  return (
    <div className="editor-pane-container">
      {/* 1. Header Toolbar */}
      <div className="editor-pane-header">
        <div className="editor-header-left">
          <div className="editor-breadcrumb">
            <span className="text-muted module-crumb" title={moduleTitle}>{moduleTitle || 'Module'}</span>
            <span className="separator">/</span>
            <span className="current-node" title={isEdit ? existingLesson?.title : 'Tạo bài học mới'}>
              {isEdit ? existingLesson?.title : 'Tạo bài học mới'}
            </span>
          </div>
          <h1 className="editor-main-title" title={isEdit ? existingLesson?.title : 'Soạn Thảo Bài Giảng Mới'}>
            {isEdit ? existingLesson?.title : 'Soạn Thảo Bài Giảng Mới'}
          </h1>
        </div>

        <div className="editor-header-right">
          {/* Quick status switch */}
          <div className="status-toggle-pill">
            <button
              type="button"
              className={`pill-btn ${currentStatus === 'DRAFT' ? 'active-draft' : ''}`}
              onClick={() => setValue('status', 'DRAFT', { shouldDirty: true })}
            >
              Bản nháp
            </button>
            <button
              type="button"
              className={`pill-btn ${currentStatus === 'PUBLISHED' ? 'active-pub' : ''}`}
              onClick={() => setValue('status', 'PUBLISHED', { shouldDirty: true })}
            >
              Xuất bản
            </button>
          </div>

          {isEdit && onDeleteLesson && (
            <button
              type="button"
              className="btn-danger-outline"
              onClick={() => onDeleteLesson(lessonId)}
              title="Xóa bài học"
            >
              <Trash2 size={15} />
              <span>Xóa</span>
            </button>
          )}

          <button type="button" className="btn-secondary" onClick={onCancel}>
            <RotateCcw size={15} />
            <span>Hủy</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
          >
            <Save size={15} />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu bài học'}</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Horizontal Tabs (Thống nhất 2 Tab cho cả Video bài giảng và Bài thực hành) */}
      <div className="lesson-editor-tabs-bar">
        <button
          type="button"
          className={`tab-item-btn ${activeTab === 'CONTENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('CONTENT')}
        >
          <BookOpen size={16} />
          <span>{currentLessonType === 'VIDEO' ? 'Nội dung bài giảng' : 'Thông tin chung'}</span>
        </button>

        <button
          type="button"
          className={`tab-item-btn ${activeTab === 'QUESTIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('QUESTIONS')}
        >
          <FileQuestion size={16} />
          <span>{currentLessonType === 'PRACTICE' ? 'Câu hỏi luyện tập' : 'Câu hỏi ôn tập'}</span>
          {practiceQuestionsList.length > 0 && (
            <span className="tab-count-badge">{practiceQuestionsList.length}</span>
          )}
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="editor-pane-body">
        {activeTab === 'CONTENT' && (
          <LessonContentTab form={form} abilities={scopedAbilities} />
        )}

        {activeTab === 'QUESTIONS' && (
          <LessonReviewQuestionsTab
            lessonId={lessonId}
            partId={resolvedPartId}
            partName={existingLesson?.partName ?? resolvedPart?.name ?? null}
            section={resolvedSection}
            defaultAbilityId={watch('abilityId') ?? null}
            parts={parts}
            abilities={abilities}
            scopedAbilities={scopedAbilities}
            initialQuestions={practiceQuestionsList}
            onSavePracticeQuestions={handleSavePracticeQuestionsLocal}
            isSaving={isSavingQuestions}
          />
        )}
      </div>
    </div>
  );
};
