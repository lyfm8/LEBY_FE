import React, { useState, useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lessonFormSchema, type LessonFormValues } from '../../utils/schema';
import type { LessonResponse, CreateLessonRequest, LessonScriptDto } from '../../types';
import type { AbilityResponse } from '@/features/admin/part/types';
import { LessonContentTab } from './LessonContentTab';
import { LessonScriptTab } from './LessonScriptTab';
import { LessonReviewQuestionsTab } from './LessonReviewQuestionsTab';
import {
  BookOpen,
  FileText,
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
  existingLesson?: LessonResponse | null;
  abilities: AbilityResponse[];
  onSaveLesson: (data: CreateLessonRequest, isEdit: boolean, id?: number) => Promise<void>;
  onSaveScripts: (lessonId: number, scripts: LessonScriptDto[]) => Promise<void>;
  onCancel: () => void;
  onDeleteLesson?: (id: number) => void;
  isSubmitting: boolean;
}

type TabType = 'CONTENT' | 'SCRIPT' | 'QUESTIONS';

export const LessonEditorView: React.FC<LessonEditorViewProps> = ({
  lessonId,
  moduleTitle,
  existingLesson,
  abilities,
  onSaveLesson,
  onSaveScripts,
  onCancel,
  onDeleteLesson,
  isSubmitting,
}) => {
  const isEdit = !!lessonId && !!existingLesson;
  const [activeTab, setActiveTab] = useState<TabType>('CONTENT');
  const [isSavingScripts, setIsSavingScripts] = useState<boolean>(false);
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

  const handleSaveScriptsLocal = async (scripts: LessonScriptDto[]) => {
    if (!lessonId) {
      toast.error('Vui lòng lưu bài học trước khi lưu kịch bản phụ đề.');
      return;
    }
    setIsSavingScripts(true);
    try {
      await onSaveScripts(lessonId, scripts);
    } finally {
      setIsSavingScripts(false);
    }
  };

  const currentStatus = watch('status');

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

      {/* 2. Navigation Horizontal Tabs */}
      <div className="lesson-editor-tabs-bar">
        <button
          type="button"
          className={`tab-item-btn ${activeTab === 'CONTENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('CONTENT')}
        >
          <BookOpen size={16} />
          <span>Nội dung bài giảng</span>
        </button>

        <button
          type="button"
          className={`tab-item-btn ${activeTab === 'SCRIPT' ? 'active' : ''}`}
          onClick={() => setActiveTab('SCRIPT')}
        >
          <FileText size={16} />
          <span>Script (Phụ đề nghe)</span>
          {existingLesson?.scripts && existingLesson.scripts.length > 0 && (
            <span className="tab-count-badge">{existingLesson.scripts.length}</span>
          )}
        </button>

        <button
          type="button"
          className={`tab-item-btn ${activeTab === 'QUESTIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('QUESTIONS')}
        >
          <FileQuestion size={16} />
          <span>Câu hỏi ôn tập</span>
          <span className="tab-future-tag">Mới</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="editor-pane-body">
        {activeTab === 'CONTENT' && (
          <LessonContentTab form={form} abilities={abilities} />
        )}

        {activeTab === 'SCRIPT' && (
          <LessonScriptTab
            lessonId={lessonId || 0}
            audioUrl={watch('audioUrl')}
            videoUrl={watch('videoUrl')}
            initialScripts={existingLesson?.scripts || []}
            onSaveScripts={handleSaveScriptsLocal}
            isSaving={isSavingScripts}
          />
        )}

        {activeTab === 'QUESTIONS' && <LessonReviewQuestionsTab />}
      </div>
    </div>
  );
};
