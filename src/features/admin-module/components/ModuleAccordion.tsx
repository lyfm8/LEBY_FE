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
    <div className="border border-gray-200 rounded-lg mb-4 bg-white overflow-hidden shadow-sm">
      {/* Header Module */}
      <div 
        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${isOpen ? 'bg-blue-50 border-b border-blue-100' : 'hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-3 flex-1" onClick={onToggle}>
          <div className="text-gray-400">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              <span className="text-blue-600 mr-2">#{moduleData.sequence}</span>
              {moduleData.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs ${
                moduleData.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {moduleData.status}
              </span>
              <span>{moduleData.type}</span>
              {moduleData.partName && <span>• {moduleData.partName}</span>}
              <span>• {moduleData.totalLessons} bài học</span>
            </div>
          </div>
        </div>
        
        {/* Actions cho Module */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onConfigTest(moduleData.id); }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md transition-colors font-medium"
          >
            Cấu hình Test
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddLesson(moduleData.id); }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors font-medium"
          >
            <Plus size={16} /> Thêm bài học
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEditModule(moduleData); }}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteModule(moduleData.id); }}
            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Body Accordion (Lessons) */}
      {isOpen && (
        <div className="p-4 bg-slate-50">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Đang tải danh sách bài học...</div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
              Chưa có bài học nào. Hãy thêm bài học mới!
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-gray-300 cursor-grab" />
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">
                      {lesson.orderNo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {lesson.lessonType === 'VIDEO' ? (
                          <Video size={16} className="text-blue-500" />
                        ) : (
                          <PenTool size={16} className="text-green-500" />
                        )}
                        <span className="font-medium text-gray-800">{lesson.title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
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
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEditLesson(lesson, moduleData.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Sửa bài học"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteLessonLocal(lesson.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
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
