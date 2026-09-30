/**
 * @file Các kiểu dữ liệu cho tính năng Ngân hàng câu hỏi
 */

export interface QuestionFilterParams {
  page: number;
  pageSize: number;
  partId?: number;
  abilityId?: number;
  type?: string;
  difficulty?: number;
  keyword?: string;
}

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK';
export type SectionType = 'LISTENING' | 'READING';

export interface QuestionListItemResponse {
  id: number;
  name: string;
  questionSummary: string;
  partName: string;
  abilityName: string;
  type: QuestionType;
  difficulty: number;
  section: SectionType;
}

export interface QuestionDetailResponse {
  id: number;
  name: string;
  type: QuestionType;
  difficulty: number;
  section: SectionType;
  partId: number;
  abilityIds: number[];
  descriptions: string;
  questionData: Record<string, any>;
  correctAnswer: Record<string, any>;
}

export interface QuestionFormData {
  name: string;
  type: QuestionType;
  difficulty: number;
  section: SectionType;
  partId: number;
  abilityIds: number[];
  descriptions: string;
  questionData: string; // Trong form sẽ lưu ở dạng string JSON để dễ chỉnh sửa
  correctAnswer: string; // Trong form sẽ lưu ở dạng string JSON
}
