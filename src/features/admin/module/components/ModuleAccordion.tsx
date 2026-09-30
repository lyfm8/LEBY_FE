import React, { useState, useEffect } from 'react';
import type { ModuleResponse, LessonResponse } from '../types';
import { adminModuleService } from '../services/adminModuleService';
import { ChevronDown, ChevronRight, Video, PenTool, Edit2, Trash2, Plus, GripVertical } from 'lucide-react';

interface ModuleAccordionProps {
  moduleData: ModuleResponse;
  isOpen: boolean;
  onToggle: () => void;
  onEditModule: (mod: ModuleResponse) => void;
  onDeleteModule: (id: number) => void;
  onAddLesson: (moduleId: number) => void;
  onEditLesson: (lesson: LessonResponse, moduleId: number) => void;
  onDeleteLesson: (id: number, moduleId: number) => void;
  onConfigTest: (moduleId: number) => void;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
  moduleData, isOpen, onToggle, onEditModule, onDeleteModule, onAddLesson, onEditLesson, onDeleteLesson, onConfigTest
}) => {
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch lessons khi accordion được mở lần đầu
  useEffect(() => {
    if (isOpen && lessons.length === 0) {
      loadLessons();
    }
  }, [isOpen]);

  const loadLessons = async () => {
    setIsLoading(true);
    try {
      const res = await adminModuleService.getLessons(moduleData.id);
      if (res.success && res.data) {
        setLessons(res.data);
      }
    } catch (error) {
      console.error('Failed to load lessons', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLessonLocal = async (id: number) => {
    await onDeleteLesson(id, moduleData.id);
    loadLessons(); // Tải lại danh sách sau khi xóa
  };

  return (
    <div className="accordion-item">
      {/* Header Module */}
      <div 
        className="accordion-header"
        onClick={onToggle}
      >
        <div className="accordion-title-wrapper">
          <div style={{ color: '#9ca3af' }}>
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <div>
            <h3 className="module-title">
              <span style={{ color: '#2563eb', marginRight: '0.5rem' }}>#{moduleData.sequence}</span>
              {moduleData.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              <span className={`badge ${moduleData.status === 'PUBLISHED' ? 'badge-green' : 'badge-yellow'}`} style={{ marginTop: 0 }}>
                {moduleData.status}
              </span>
              <span>{moduleData.type}</span>
              {moduleData.partName && <span>• {moduleData.partName}</span>}
              <span>• {moduleData.totalLessons} bài học</span>
            </div>
          </div>
        </div>
        
        {/* Actions cho Module */}
        <div className="accordion-actions">
          <button 
            onClick={(e) => { e.stopPropagation(); onConfigTest(moduleData.id); }}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: '#7e22ce', borderColor: '#d8b4fe', backgroundColor: '#f3e8ff' }}
          >
            Cấu hình Test
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddLesson(moduleData.id); }}
            className="btn-primary"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
          >
            <Plus size={14} /> Thêm bài học
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEditModule(moduleData); }}
            className="btn-icon primary"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteModule(moduleData.id); }}
            className="btn-icon danger"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Body Accordion (Lessons) */}
      {isOpen && (
        <div className="accordion-content">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Đang tải danh sách bài học...</div>
          ) : lessons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', border: '2px dashed #d1d5db', borderRadius: '0.5rem', color: '#6b7280' }}>
              Chưa có bài học nào. Hãy thêm bài học mới!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {lessons.map((lesson) => (
                <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <GripVertical size={16} color="#d1d5db" style={{ cursor: 'grab' }} />
                    <div className="module-order">
                      {lesson.orderNo}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: '#1f2937' }}>
                        {lesson.lessonType === 'VIDEO' ? (
                          <Video size={16} color="#3b82f6" />
                        ) : (
                          <PenTool size={16} color="#10b981" />
                        )}
                        <span>{lesson.title}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {lesson.lessonType === 'VIDEO' && lesson.durationDisplay && (
                          <span>Thời lượng: {lesson.durationDisplay}</span>
                        )}
                        {lesson.lessonType === 'PRACTICE' && lesson.totalQuestions && (
                          <span>Số câu hỏi: {lesson.totalQuestions}</span>
                        )}
                        {lesson.abilityName && <span>• Năng lực: {lesson.abilityName}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={() => onEditLesson(lesson, moduleData.id)}
                      className="btn-icon primary"
                      title="Sửa bài học"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteLessonLocal(lesson.id)}
                      className="btn-icon danger"
                      title="Xóa bài học"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
