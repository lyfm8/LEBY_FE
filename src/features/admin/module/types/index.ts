/**
 * @file Cấu trúc Types cho Quản lý Module & Lesson (Use Case A05).
 */

export type ModuleType = 'THEORY' | 'PRACTICE' | 'EXAM';
export type LessonType = 'VIDEO' | 'PRACTICE';
export type StatusType = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface ModuleFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: ModuleType;
  status?: StatusType;
}

export interface LessonScriptDto {
  id?: number;
  orderNo: number;
  startTime: string;
  endTime: string;
  speaker?: string;
  contentEn: string;
  contentVi?: string;
}

export interface LessonResponse {
  id: number;
  title: string;
  orderNo: number;
  status: StatusType;
  lessonType: LessonType;
  durationSeconds: number;
  descriptions?: string | null;
  abilityId: number | null;
  abilityName: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  isFree?: boolean;
  moduleId?: number;
  moduleTitle?: string;
  scripts?: LessonScriptDto[];
}

export interface ModuleResponse {
  id: number;
  title: string;
  type: ModuleType;
  sequence: number;
  status: StatusType;
  defaultPassScore: number;
  requiredCompletionRate: number;
  descriptions?: string | null;
  partId: number | null;
  partName: string | null;
  abilityIds?: number[];
  abilityNames?: string[];
  totalLessons: number;
  lessons?: LessonResponse[];
}

export interface CreateModuleRequest {
  title: string;
  type: ModuleType;
  sequence?: number;
  status: StatusType;
  defaultPassScore: number;
  requiredCompletionRate: number;
  descriptions?: string;
  partId: number | null;
  abilityIds?: number[];
}

export interface UpdateModuleThresholdsRequest {
  defaultPassScore: number;
  requiredCompletionRate: number;
}

export interface CreateLessonRequest {
  title: string;
  orderNo?: number;
  status: StatusType;
  lessonType: LessonType;
  durationSeconds?: number;
  descriptions?: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  abilityId: number | null;
  isFree?: boolean;
}

export interface SaveLessonScriptsRequest {
  scripts: LessonScriptDto[];
}

/**
 * Định nghĩa các chế độ hiển thị linh hoạt của vùng Editor bên phải (75%).
 */
export type EditorActiveView =
  | { type: 'MODULE_CREATE' }
  | { type: 'MODULE_EDIT'; moduleId: number }
  | { type: 'MODULE_CONFIGS' }
  | { type: 'LESSON_EDIT'; lessonId: number; moduleId: number }
  | { type: 'LESSON_CREATE'; moduleId: number }
  | { type: 'MODULE_TEST'; moduleId: number };
