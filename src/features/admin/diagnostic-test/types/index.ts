/**
 * Các kiểu dữ liệu cốt lõi cho module Quản lý Đề thi (Diagnostic Test & Mock Test).
 */

export type ExamType = 'DIAGNOSTIC' | 'FULL_MOCK_TEST';
export type ExamStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVE';

/**
 * Dữ liệu từng dòng trong bảng Danh sách đề thi.
 */
export interface ExamListItem {
  id: number;
  title: string;
  description?: string;
  testType: ExamType;
  examStatus: ExamStatus;
  durationMinutes: number;
  totalQuestions: number;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Câu hỏi nằm trong đề thi.
 */
export interface ExamQuestionItem {
  id?: number;
  questionId: number;
  orderNo: number;
  points: number;
  questionCode: string;
  questionName: string;
  partId?: number;
  partNumber: number;
  partName: string;
  section: 'LISTENING' | 'READING';
  difficulty?: number;
  abilityNames?: string[];
}

/**
 * Chi tiết bộ đề thi.
 */
export interface ExamDetail {
  id: number;
  title: string;
  description?: string;
  testType: ExamType;
  examStatus: ExamStatus;
  durationMinutes: number;
  totalQuestions: number;
  listeningCount: number;
  readingCount: number;
  partDistribution: Record<number, number>;
  questions: ExamQuestionItem[];
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Thông tin một Ability trong hệ thống.
 */
export interface AbilityAvailabilityItem {
  id: number;
  name: string;
  section?: string;
  partNumber?: number;
  availableQuestionCount: number;
}

/**
 * Dữ liệu phản hồi kiểm tra khả dụng ma trận câu hỏi trong Question Bank.
 */
export interface ExamMatrixAvailability {
  partAvailableCounts: Record<number, number>;
  singlePassageCount: number;
  multiplePassageCount: number;
  abilities: AbilityAvailabilityItem[];
}

/**
 * Dữ liệu phản hồi khi tự động chọn câu hỏi ngẫu nhiên.
 */
export interface AutoSelectResponse {
  totalSelected: number;
  questionIds: number[];
  questions: ExamQuestionItem[];
}

/**
 * Dữ liệu gửi lên khi tạo mới hoặc cập nhật đề thi.
 */
export interface ExamFormPayload {
  title: string;
  description?: string;
  testType: ExamType;
  durationMinutes: number;
  questionIds: number[];
  isDraft?: boolean;
}

/**
 * Dữ liệu bộ lọc trên trang danh sách đề thi.
 */
export interface ExamListFilters {
  tab: 'ALL' | 'DIAGNOSTIC' | 'FULL_MOCK_TEST';
  keyword: string;
  examStatus?: ExamStatus | 'ALL';
  testType?: ExamType | 'ALL';
  page: number;
  size: number;
}

/**
 * Trạng thái của từng tiêu chí trong Checklist kiểm tra trước khi lưu.
 */
export interface ChecklistItemStatus {
  id: string;
  label: string;
  isPassed: boolean;
  message?: string;
}
