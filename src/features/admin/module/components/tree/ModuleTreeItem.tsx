import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ModuleResponse, LessonResponse, EditorActiveView } from '../../types';
import {
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Video,
  ClipboardList,
} from 'lucide-react';

/**
 * Chuyển đổi giây sang chuỗi mm:ss để hiển thị thời lượng bài học trên Tree.
 */
const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

interface ModuleTreeItemProps {
  moduleData: ModuleResponse;
  index: number;
  activeView: EditorActiveView;
  onSelectView: (view: EditorActiveView) => void;
  onDeleteModule: (id: number) => void;
  onDeleteLesson: (lessonId: number, moduleId: number) => void;
  onReorderLessons: (moduleId: number, orderedIds: number[]) => void;
  isDragEnabled: boolean;
  isDragOver: boolean;
  onModuleDragStart: (index: number) => void;
  onModuleDragOver: (e: React.DragEvent, index: number) => void;
  onModuleDrop: (index: number) => void;
  onModuleDragEnd: () => void;
}

export const ModuleTreeItem: React.FC<ModuleTreeItemProps> = ({
  moduleData,
  index,
  activeView,
  onSelectView,
  onDeleteModule,
  onDeleteLesson,
  onReorderLessons,
  isDragEnabled,
  isDragOver,
  onModuleDragStart,
  onModuleDragOver,
  onModuleDrop,
  onModuleDragEnd,
}) => {
  const isModuleActive =
    (activeView.type === 'MODULE_EDIT' ||
      activeView.type === 'MODULE_TEST' ||
      activeView.type === 'LESSON_EDIT' ||
      activeView.type === 'LESSON_CREATE') &&
    activeView.moduleId === moduleData.id;

  const [isExpanded, setIsExpanded] = useState<boolean>(index === 0 || isModuleActive);

  useEffect(() => {
    if (isModuleActive) {
      setIsExpanded(true);
    }
  }, [isModuleActive]);

  // Drag-and-drop state cho Lesson bên trong Module
  const [dragOverLessonIndex, setDragOverLessonIndex] = useState<number | null>(null);
  const draggedLessonIndexRef = useRef<number | null>(null);

  const isTestActive =
    activeView.type === 'MODULE_TEST' && activeView.moduleId === moduleData.id;

  const lessons = moduleData.lessons || [];

  /**
   * Di chuyển Lesson lên/xuống bằng nút bấm.
   */
  const moveLessonByIndex = useCallback(
    (fromIdx: number, direction: 'up' | 'down') => {
      const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= lessons.length) return;
      const reordered = [...lessons];
      [reordered[fromIdx], reordered[toIdx]] = [reordered[toIdx], reordered[fromIdx]];
      onReorderLessons(moduleData.id, reordered.map((l) => l.id));
    },
    [lessons, moduleData.id, onReorderLessons]
  );

  const handleLessonDragStart = useCallback((lessonIdx: number, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', `lesson-${lessonIdx}`);
    e.stopPropagation();
    draggedLessonIndexRef.current = lessonIdx;
  }, []);

  const handleLessonDragOver = useCallback((e: React.DragEvent, lessonIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLessonIndex(lessonIdx);
  }, []);

  const handleLessonDrop = useCallback(
    (e: React.DragEvent, targetIdx: number) => {
      e.preventDefault();
      e.stopPropagation();
      const fromIdx = draggedLessonIndexRef.current;
      if (fromIdx === null || fromIdx === targetIdx) {
        setDragOverLessonIndex(null);
        return;
      }
      const reordered = [...lessons];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(targetIdx, 0, moved);
      onReorderLessons(moduleData.id, reordered.map((l) => l.id));
      setDragOverLessonIndex(null);
      draggedLessonIndexRef.current = null;
    },
    [lessons, moduleData.id, onReorderLessons]
  );

  const handleLessonDragEnd = useCallback(() => {
    setDragOverLessonIndex(null);
    draggedLessonIndexRef.current = null;
  }, []);

  const getStatusDotClass = (status: string) => {
    if (status === 'PUBLISHED') return 'dot-published';
    if (status === 'ARCHIVED') return 'dot-archived';
    return 'dot-draft';
  };

  const getStatusTitle = (status: string) => {
    if (status === 'PUBLISHED') return 'Đã xuất bản';
    if (status === 'ARCHIVED') return 'Tạm ẩn';
    return 'Bản nháp';
  };

  return (
    <div
      className={`tree-module-item ${isModuleActive ? 'active-module' : ''} ${isDragOver ? 'drag-over-indicator' : ''}`}
      onDragOver={(e) => onModuleDragOver(e, index)}
      onDrop={() => onModuleDrop(index)}
      onDragEnd={onModuleDragEnd}
    >
      {/* 1. Header của Module */}
      <div
        className="tree-module-header"
        onClick={() => onSelectView({ type: 'MODULE_EDIT', moduleId: moduleData.id })}
      >
        <div className="tree-module-header-left">
          {/* Grip handle CHỈ kích hoạt drag khi kéo biểu tượng này */}
          {isDragEnabled && (
            <span
              className="drag-grip-handle"
              title="Kéo biểu tượng này để sắp xếp thứ tự Module"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                onModuleDragStart(index);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={14} />
            </span>
          )}

          <button
            type="button"
            className="tree-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            title={isExpanded ? 'Thu gọn bài học' : 'Mở rộng bài học'}
          >
            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>

          <span className="tree-sequence-badge">#{moduleData.sequence}</span>
          <span className="tree-module-title" title={moduleData.title}>
            {moduleData.title}
          </span>
        </div>

        <div className="tree-module-header-right">
          <span className="module-count-pill" title={`${lessons.length} bài học trong module`}>
            {lessons.length} bài
          </span>

          <span
            className={`tree-status-dot ${getStatusDotClass(moduleData.status)}`}
            title={`Trạng thái: ${getStatusTitle(moduleData.status)}`}
          />

          <div className="tree-actions-hover">
            <button
              type="button"
              className="tree-icon-btn delete-btn"
              title="Xóa Module"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteModule(moduleData.id);
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Danh sách con khi Module được mở rộng */}
      {isExpanded && (
        <div className="tree-module-children">
          {lessons.length > 0 ? (
            lessons.map((lesson: LessonResponse, lessonIdx: number) => {
              const isLessonActive =
                activeView.type === 'LESSON_EDIT' &&
                activeView.lessonId === lesson.id &&
                activeView.moduleId === moduleData.id;

              return (
                <div
                  key={lesson.id}
                  className={`tree-leaf-item ${isLessonActive ? 'active-leaf' : ''} ${dragOverLessonIndex === lessonIdx ? 'drag-over-lesson' : ''}`}
                  onDragOver={(e) => handleLessonDragOver(e, lessonIdx)}
                  onDrop={(e) => handleLessonDrop(e, lessonIdx)}
                  onDragEnd={handleLessonDragEnd}
                  onClick={() =>
                    onSelectView({
                      type: 'LESSON_EDIT',
                      lessonId: lesson.id,
                      moduleId: moduleData.id,
                    })
                  }
                >
                  <div className="tree-leaf-left">
                    {/* Grip handle cho Lesson: chỉ kéo khi cầm grip */}
                    {isDragEnabled && (
                      <span
                        className="drag-grip-handle-sm"
                        title="Kéo để đổi thứ tự bài học"
                        draggable
                        onDragStart={(e) => handleLessonDragStart(lessonIdx, e)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={12} />
                      </span>
                    )}

                    {lesson.lessonType === 'VIDEO' ? (
                      <span title="Bài giảng Video" className="flex items-center">
                        <Video size={13} className="leaf-icon text-blue flex-shrink-0" />
                      </span>
                    ) : (
                      <span title="Bài thực hành" className="flex items-center">
                        <ClipboardList size={13} className="leaf-icon text-orange flex-shrink-0" />
                      </span>
                    )}

                    <span className="leaf-order">{String(lesson.orderNo).padStart(2, '0')}.</span>
                    <span className="leaf-title" title={lesson.title}>
                      {lesson.title}
                    </span>
                  </div>

                  <div className="tree-leaf-right">
                    {/* Thời lượng & trạng thái bài học */}
                    <div className="leaf-meta-tags">
                      {lesson.durationSeconds > 0 && (
                        <span className="duration-tag" title={`Thời lượng: ${formatDuration(lesson.durationSeconds)}`}>
                          {formatDuration(lesson.durationSeconds)}
                        </span>
                      )}

                      <span
                        className={`tree-status-dot ${getStatusDotClass(lesson.status)}`}
                        title={`Trạng thái: ${getStatusTitle(lesson.status)}`}
                      />
                    </div>

                    {/* Action buttons chỉ xuất hiện khi hover hàng bài học */}
                    <div className="tree-actions-hover">
                      {isDragEnabled && (
                        <span className="move-btn-group">
                          <button
                            type="button"
                            className="tree-icon-btn move-btn"
                            title="Di chuyển lên"
                            disabled={lessonIdx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLessonByIndex(lessonIdx, 'up');
                            }}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            className="tree-icon-btn move-btn"
                            title="Di chuyển xuống"
                            disabled={lessonIdx === lessons.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLessonByIndex(lessonIdx, 'down');
                            }}
                          >
                            <ArrowDown size={12} />
                          </button>
                        </span>
                      )}

                      <button
                        type="button"
                        className="tree-icon-btn delete-btn"
                        title="Xóa bài học"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLesson(lesson.id, moduleData.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="tree-empty-hint">Chưa có bài học nào</div>
          )}

          {/* Module Test row */}
          <div
            className={`tree-leaf-item test-leaf ${isTestActive ? 'active-leaf' : ''}`}
            onClick={() => onSelectView({ type: 'MODULE_TEST', moduleId: moduleData.id })}
          >
            <div className="tree-leaf-left">
              <FileCheck2 size={14} className="leaf-icon text-orange" />
              <span className="leaf-title font-medium">Bài thi vượt ải (Module Test)</span>
            </div>
            <div className="tree-leaf-right">
              <span className="pass-score-pill">{moduleData.defaultPassScore}đ</span>
            </div>
          </div>

          {/* Nút thêm bài học */}
          <button
            type="button"
            className="tree-add-lesson-btn"
            onClick={() => onSelectView({ type: 'LESSON_CREATE', moduleId: moduleData.id })}
          >
            <Plus size={13} />
            <span>Thêm bài học mới</span>
          </button>
        </div>
      )}
    </div>
  );
};
