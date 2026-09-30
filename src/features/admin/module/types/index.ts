/**
 * @file Cấu trúc Types cho UC05: Module & Lesson
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

export interface ModuleResponse {
  id: number;
  title: string;
  type: ModuleType;
  sequence: number;
  status: StatusType;
  partId: number | null;
  partName: string | null;
  totalLessons: number;
  totalVideoLessons: number;
  totalPracticeLessons: number;
}

export interface LessonResponse {
  id: number;
  lessonType: LessonType;
  title: string;
  orderNo: number;
  status: StatusType;
  abilityId: number | null;
  abilityName: string | null;
  uri: string | null;
  durationSeconds: number | null;
  durationDisplay: string | null;
  totalQuestions: number | null;
}

export interface CreateModuleRequest {
  title: string;
  type: ModuleType;
  sequence: number;
  status: StatusType;
  partId: number | null;
}

export interface CreateVideoLessonRequest {
  title: string;
  orderNo: number;
  descriptions?: string;
  uri: string;
  durationSeconds: number;
  abilityId: number | null;
  status: StatusType;
}

export interface CreatePracticeLessonRequest {
  title: string;
  orderNo: number;
  descriptions?: string;
  instructions?: string;
  abilityId: number | null;
  questionIds: number[];
  status: StatusType;
}
