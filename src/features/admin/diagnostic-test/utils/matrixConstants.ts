/**
 * Các hằng số ma trận cấu trúc đề thi TOEIC chuẩn ETS và đề chẩn đoán.
 */

export interface PartMatrixConfig {
  partNumber: number;
  partName: string;
  questionTypeName: string;
  section: 'LISTENING' | 'READING';
  standardCount: number;
}

/**
 * Ma trận chuẩn ETS 200 câu hỏi (100 câu Listening + 100 câu Reading).
 */
export const ETS_MOCK_TEST_MATRIX: PartMatrixConfig[] = [
  // LISTENING (100 câu)
  { partNumber: 1, partName: 'Part 1', questionTypeName: 'Photographs (Mô tả tranh)', section: 'LISTENING', standardCount: 6 },
  { partNumber: 2, partName: 'Part 2', questionTypeName: 'Question – Response (Hỏi đáp)', section: 'LISTENING', standardCount: 25 },
  { partNumber: 3, partName: 'Part 3', questionTypeName: 'Conversations (Hội thoại)', section: 'LISTENING', standardCount: 39 },
  { partNumber: 4, partName: 'Part 4', questionTypeName: 'Talks (Bài nói ngắn)', section: 'LISTENING', standardCount: 30 },

  // READING (100 câu)
  { partNumber: 5, partName: 'Part 5', questionTypeName: 'Incomplete Sentences (Hoàn thành câu)', section: 'READING', standardCount: 30 },
  { partNumber: 6, partName: 'Part 6', questionTypeName: 'Text Completion (Hoàn thành đoạn văn)', section: 'READING', standardCount: 16 },
  { partNumber: 7, partName: 'Part 7', questionTypeName: 'Reading Comprehension (Đọc hiểu)', section: 'READING', standardCount: 54 },
];

export const PART_7_BREAKDOWN = {
  singlePassages: 29,
  multiplePassages: 25,
  total: 54,
};

export const DEFAULT_EXAM_CONFIGS = {
  DIAGNOSTIC: {
    durationMinutes: 45,
    suggestedQuestions: 60,
    totalQuestions: 60,
    titlePlaceholder: 'TOEIC Placement Test',
    descriptionPlaceholder: 'Đề thi chẩn đoán năng lực đầu vào của học viên.',
  },
  FULL_MOCK_TEST: {
    durationMinutes: 120,
    totalQuestions: 200,
    listeningQuestions: 100,
    readingQuestions: 100,
    titlePlaceholder: 'TOEIC Mock Test',
    descriptionPlaceholder: 'Bộ đề thi thử TOEIC tổng hợp theo cấu trúc ETS mới nhất.',
  },
};

