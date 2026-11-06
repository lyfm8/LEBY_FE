import React, { useState } from 'react';
import type { ModuleResponse, LessonResponse, EditorActiveView } from '../../types';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileCheck2,
  Plus,
  Trash2,
} from 'lucide-react';

interface ModuleTreeItemProps {
  moduleData: ModuleResponse;
  activeView: EditorActiveView;
  onSelectView: (view: EditorActiveView) => void;
  onDeleteModule: (id: number) => void;
  onDeleteLesson: (lessonId: number, moduleId: number) => void;
}

export const ModuleTreeItem: React.FC<ModuleTreeItemProps> = ({
  moduleData,
  activeView,
  onSelectView,
  onDeleteModule,
  onDeleteLesson,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const isModuleActive =
    activeView.type === 'MODULE_EDIT' && activeView.moduleId === moduleData.id;

  const isTestActive =
    activeView.type === 'MODULE_TEST' && activeView.moduleId === moduleData.id;

  return (
    <div className={`tree-module-item ${isModuleActive ? 'active-module' : ''}`}>
      {/* Header của Module */}
      <div
        className="tree-module-header"
        onClick={() => onSelectView({ type: 'MODULE_EDIT', moduleId: moduleData.id })}
      >
        <div className="tree-module-header-left">
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
            className={`tree-status-dot ${
              moduleData.status === 'PUBLISHED' ? 'dot-published' : 'dot-draft'
            }`}
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
          {moduleData.lessons && moduleData.lessons.length > 0 ? (
            moduleData.lessons.map((lesson: LessonResponse) => {
              const isLessonActive =
                activeView.type === 'LESSON_EDIT' &&
                activeView.lessonId === lesson.id &&
                activeView.moduleId === moduleData.id;

              return (
                <div
                  key={lesson.id}
                  className={`tree-leaf-item ${isLessonActive ? 'active-leaf' : ''}`}
                  onClick={() =>
                    onSelectView({
                      type: 'LESSON_EDIT',
                      lessonId: lesson.id,
                      moduleId: moduleData.id,
                    })
                  }
                >
                  <div className="tree-leaf-left">
                    <BookOpen size={14} className="leaf-icon text-muted" />
                    <span className="leaf-order">0{lesson.orderNo}.</span>
                    <span className="leaf-title" title={lesson.title}>
                      {lesson.title}
                    </span>
                  </div>

                  <div className="tree-leaf-right">
                    <span
                      className={`leaf-badge ${
                        lesson.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'
                      }`}
                    >
                      {lesson.status === 'PUBLISHED' ? 'Pub' : 'Draft'}
                    </span>
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
