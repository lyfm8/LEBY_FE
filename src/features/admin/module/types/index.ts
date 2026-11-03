/**
 * @file Cấu trúc Types cho UC05: Module & Lesson
 */

export type ModuleType = 'THEORY' | 'PRACTICE' | 'EXAM';
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
}

export interface LessonResponse {
  id: number;
  title: string;
  orderNo: number;
  status: StatusType;
  descriptions?: string | null;
  abilityId: number | null;
  abilityName: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
}

export interface CreateModuleRequest {
  title: string;
  type: ModuleType;
  sequence: number;
  status: StatusType;
  partId?: number | null;
}

export interface CreateLessonRequest {
  title: string;
  orderNo: number;
  descriptions?: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  abilityId: number | null;
  status: StatusType;
}
