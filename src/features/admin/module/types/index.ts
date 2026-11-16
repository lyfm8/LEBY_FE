/**
 * @file Cấu trúc Types cho Quản lý Module & Lesson (Use Case A05).
 */

export type ModuleType = 'THEORY' | 'PRACTICE' | 'EXAM';
export type LessonType = 'VIDEO' | 'PRACTICE';
export type StatusType = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
export type SectionType = 'LISTENING' | 'READING';
export type QuestionStructureFilter = 'ALL' | 'STANDALONE' | 'GROUP';

export interface PracticeQuestionResponse {
  id?: number;
  questionId: number;
  orderNo: number;
  points: number;
  questionName: string;
  questionSummary: string;
  questionType: string;
  partId: number | null;
  partName: string | null;
  section: SectionType | null;
  difficulty: number | null;
  parentId: number | null;
  parentName: string | null;
  abilityNames: string[];
}

export interface PracticeQuestionItemDto {
  questionId: number;
  orderNo: number;
  points: number;
}

export interface SavePracticeQuestionsRequest {
  items: PracticeQuestionItemDto[];
}

export interface QuestionBankItem {
  id: number;
  name: string;
  summary: string;
  type: string;
  partId: number | null;
  partName: string | null;
  section: SectionType | null;
  difficulty: number | null;
  isGroup: boolean;
  itemCount: number;
  abilityNames: string[];
  mediaKinds: string[];
  updatedAt?: string;
}

export interface QuestionBankFilterParams {
  page?: number;
  size?: number;
  keyword?: string;
  section?: SectionType;
  partId?: number;
  abilityId?: number;
  difficulty?: number;
  structureType?: QuestionStructureFilter;
}

export interface QuestionDetailSubItem {
  id: number;
  name: string;
  orderNo: number | null;
  text: string;
  difficulty: number | null;
  abilities?: Array<{ id: number; name: string }>;
}

export interface QuestionDetailDto {
  id: number;
  name: string;
  type: string;
  partId: number | null;
  partName: string | null;
  section: SectionType | null;
  difficulty: number | null;
  text?: string | null;
  isGroup?: boolean;
  abilities?: Array<{ id: number; name: string }>;
  subQuestions?: QuestionDetailSubItem[];
}

export interface QuestionMediaAttachItem {
  mediaId: number;
  orderNo: number;
}

export interface QuickCreateQuestionPayload {
  name: string;
  partId: number;
  abilityIds: number[];
  difficulty: number;
  text: string;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctKey: 'A' | 'B' | 'C' | 'D';
  explanation?: {
    transcript?: string;
    analysis?: string;
    translation?: string;
    clue?: string;
  };
  medias?: QuestionMediaAttachItem[];
  descriptions?: string;
}

export interface QuickCreateGroupSubItemPayload {
  name: string;
  orderNo: number;
  text: string;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctKey: 'A' | 'B' | 'C' | 'D';
  abilityIds: number[];
  difficulty: number;
  explanation?: {
    analysis?: string;
    translation?: string;
    clue?: string;
  };
}

export interface QuickCreateQuestionGroupPayload {
  name: string;
  partId: number;
  instruction?: string;
  passage?: string;
  transcript?: string;
  translation?: string;
  medias?: QuestionMediaAttachItem[];
  items: QuickCreateGroupSubItemPayload[];
  descriptions?: string;
}

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
  partId?: number | null;
  partName?: string | null;
  section?: SectionType | null;
  scripts?: LessonScriptDto[];
  practiceQuestions?: PracticeQuestionResponse[];
  practiceQuestionCount?: number;
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

/**
 * Phương thức thiết lập bộ câu hỏi cho Bài thi vượt ải mô-đun.
 */
export type ModuleTestSelectionMode = 'MANUAL' | 'RANDOM_BY_ABILITY';

/**
 * Dòng tổng quan trạng thái Bài thi vượt ải của từng mô-đun trên trang danh sách.
 */
export interface ModuleTestOverviewItem {
  moduleId: number;
  moduleTitle: string;
  sequence: number;
  moduleStatus: StatusType;
  partId: number | null;
  partName: string | null;
  abilityIds: number[];
  abilityNames: string[];
  totalLessons: number;
  totalVideoLessons: number;
  defaultPassScore: number;
  requiredCompletionRate: number;
  durationMinutes: number;
  questionCount: number;
  currentQuestionCount: number;
  shuffleQuestions: boolean;
  selectionMode: ModuleTestSelectionMode;
  hasTestConfigured: boolean;
  hasNoLessonsWarning: boolean;
}

/**
 * Một câu hỏi đã gắn vào danh sách Bài thi vượt ải mô-đun.
 */
export interface ModuleTestQuestionItem {
  id: number | null;
  questionId: number;
  orderNo: number;
  points: number;
  questionName: string;
  questionSummary: string;
  questionType: string;
  partId: number | null;
  partName: string | null;
  section: SectionType | null;
  difficulty: number | null;
  parentId: number | null;
  parentName: string | null;
  abilityIds: number[];
  abilityNames: string[];
  isMatchingAbility: boolean;
  hasAttemptHistory: boolean;
}

/**
 * Chi tiết cấu hình Bài thi vượt ải của một mô-đun.
 */
export interface ModuleTestConfigDetail {
  moduleId: number;
  moduleTitle: string;
  sequence: number;
  moduleStatus: StatusType;
  partId: number | null;
  partName: string | null;
  section: SectionType | null;
  abilityIds: number[];
  abilityNames: string[];
  totalLessons: number;
  totalVideoLessons: number;
  defaultPassScore: number;
  requiredCompletionRate: number;
  durationMinutes: number;
  questionCount: number;
  currentQuestionCount: number;
  shuffleQuestions: boolean;
  selectionMode: ModuleTestSelectionMode;
  availableAbilityQuestionCount: number;
  hasTestConfigured: boolean;
  hasNoLessonsWarning: boolean;
  questions: ModuleTestQuestionItem[];
}

/**
 * Payload gửi lên Backend khi lưu cấu hình Bài thi vượt ải mô-đun.
 */
export interface SaveModuleTestConfigRequest {
  durationMinutes: number;
  questionCount: number;
  shuffleQuestions: boolean;
  selectionMode: ModuleTestSelectionMode;
  questionIds?: number[];
  confirmMismatchAbility?: boolean;
}

/**
 * Payload gửi lên Backend khi tự động bốc ngẫu nhiên câu hỏi theo năng lực mô-đun.
 */
export interface AutoSelectModuleTestQuestionsRequest {
  questionCount: number;
  onlyMatchingAbilities?: boolean;
}
