import React, { useState, useCallback, useRef } from 'react';
import type { ModuleResponse, LessonResponse, EditorActiveView } from '../../types';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
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
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Drag-and-drop state cho Lesson bên trong Module
  const [dragOverLessonIndex, setDragOverLessonIndex] = useState<number | null>(null);
  const draggedLessonIndexRef = useRef<number | null>(null);

  const isModuleActive =
    activeView.type === 'MODULE_EDIT' && activeView.moduleId === moduleData.id;

  const isTestActive =
    activeView.type === 'MODULE_TEST' && activeView.moduleId === moduleData.id;

  const lessons = moduleData.lessons || [];

  /**
   * Di chuyển Lesson lên/xuống bằng nút bấm (thay thế cho drag trên màn hình nhỏ).
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
    // Đánh dấu đây là Lesson drag (để phân biệt với Module drag)
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

  // CSS class cho trạng thái status (bao gồm ARCHIVED)
  const getStatusBadgeClass = (status: string) => {
    if (status === 'PUBLISHED') return 'badge-published';
    if (status === 'ARCHIVED') return 'badge-archived';
    return 'badge-draft';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'PUBLISHED') return 'Pub';
    if (status === 'ARCHIVED') return 'Arc';
    return 'Draft';
  };

  const getStatusDotClass = (status: string) => {
    if (status === 'PUBLISHED') return 'dot-published';
    if (status === 'ARCHIVED') return 'dot-archived';
    return 'dot-draft';
  };

  return (
    <div
      className={`tree-module-item ${isModuleActive ? 'active-module' : ''} ${isDragOver ? 'drag-over-indicator' : ''}`}
      draggable={isDragEnabled}
      onDragStart={() => onModuleDragStart(index)}
      onDragOver={(e) => onModuleDragOver(e, index)}
      onDrop={() => onModuleDrop(index)}
      onDragEnd={onModuleDragEnd}
    >
      {/* Header của Module */}
      <div
        className="tree-module-header"
        onClick={() => onSelectView({ type: 'MODULE_EDIT', moduleId: moduleData.id })}
      >
        <div className="tree-module-header-left">
          {/* Grip handle hiển thị khi kéo thả được */}
          {isDragEnabled && (
            <span className="drag-grip-handle" title="Kéo thả để sắp xếp">
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
            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <span className="tree-sequence-badge">#{moduleData.sequence}</span>
          <span className="tree-module-title" title={moduleData.title}>
            {moduleData.title}
          </span>
        </div>

        <div className="tree-module-header-right">
          <span
            className={`tree-status-dot ${getStatusDotClass(moduleData.status)}`}
            title={`Trạng thái: ${moduleData.status}`}
          />
          <button
            type="button"
            className="tree-icon-btn delete-btn"
            title="Xóa Module"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteModule(moduleData.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Danh sách con khi Module được mở rộng */}
      {isExpanded && (
        <div className="tree-module-children">
          {/* 1. Danh sách Lessons */}
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
                  draggable={isDragEnabled}
                  onDragStart={(e) => handleLessonDragStart(lessonIdx, e)}
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
                    {/* Grip handle cho Lesson */}
                    {isDragEnabled && (
                      <span className="drag-grip-handle-sm" title="Kéo thả bài học">
                        <GripVertical size={12} />
                      </span>
                    )}
                    <BookOpen size={14} className="leaf-icon text-muted" />
                    <span className="leaf-order">0{lesson.orderNo}.</span>
                    <span className="leaf-title" title={lesson.title}>
                      {lesson.title}
                    </span>
                  </div>

                  <div className="tree-leaf-right">
                    {/* Badge loại bài học: VIDEO hoặc PRACTICE */}
                    {lesson.lessonType && (
                      <span
                        className={`lesson-type-badge ${lesson.lessonType === 'VIDEO' ? 'type-video' : 'type-practice'}`}
                        title={lesson.lessonType === 'VIDEO' ? 'Bài giảng Video' : 'Bài thực hành'}
                      >
                        {lesson.lessonType === 'VIDEO' ? <Video size={10} /> : <ClipboardList size={10} />}
                        {lesson.lessonType}
                      </span>
                    )}

                    {/* Thời lượng mm:ss */}
                    {lesson.durationSeconds > 0 && (
                      <span className="duration-tag" title={`Thời lượng: ${formatDuration(lesson.durationSeconds)}`}>
                        {formatDuration(lesson.durationSeconds)}
                      </span>
                    )}

                    {/* Trạng thái */}
                    <span className={`leaf-badge ${getStatusBadgeClass(lesson.status)}`}>
                      {getStatusLabel(lesson.status)}
                    </span>

                    {/* Nút di chuyển lên/xuống */}
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
              );
            })
          ) : (
            <div className="tree-empty-hint">Chưa có bài học nào</div>
          )}

          {/* 2. Bài thi vượt ải của Module (Module Test) */}
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

          {/* 3. Nút Thêm bài học mới trong Module này */}
          <button
            type="button"
            className="tree-add-lesson-btn"
            onClick={() => onSelectView({ type: 'LESSON_CREATE', moduleId: moduleData.id })}
          >
            <Plus size={13} />
            <span>Thêm bài học</span>
          </button>
        </div>
      )}
    </div>
  );
};
