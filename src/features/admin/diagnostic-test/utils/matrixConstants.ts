import type { AbilityAvailabilityItem } from '../types';

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

export const DEFAULT_MIN_EVIDENCE_COUNT = 3;

export const DEFAULT_DIAGNOSTIC_PART_COUNTS: Record<number, number> = {
  1: 6,
  2: 9,
  3: 6,
  4: 6,
  5: 9,
  6: 6,
  7: 6,
};

export const DEFAULT_EXAM_CONFIGS = {
  DIAGNOSTIC: {
    durationMinutes: 45,
    suggestedQuestions: 48,
    totalQuestions: 48,
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

export interface DiagnosticMatrixSummary {
  partCounts: Record<number, number>;
  minPartCounts: Record<number, number>;
  minRequiredTotal: number;
  isBelowMinimum: boolean;
}

/**
 * Tính tổng số câu tối thiểu bắt buộc của đề chẩn đoán từ Quy tắc Đánh giá Năng lực.
 */
export function getMinRequiredDiagnosticQuestions(abilities?: AbilityAvailabilityItem[]): number {
  if (!abilities || abilities.length === 0) {
    return DEFAULT_EXAM_CONFIGS.DIAGNOSTIC.totalQuestions;
  }
  return abilities.reduce(
    (sum, ab) => sum + (ab.minEvidenceCount && ab.minEvidenceCount > 0 ? ab.minEvidenceCount : DEFAULT_MIN_EVIDENCE_COUNT),
    0
  );
}

/**
 * Tính phân bổ câu hỏi cho 7 Part của Đề thi chẩn đoán dựa trên Quy tắc Đánh giá Năng lực và tổng số câu mục tiêu.
 */
export function buildDiagnosticMatrixSummary(
  abilities: AbilityAvailabilityItem[],
  targetTotal: number
): DiagnosticMatrixSummary {
  const minPartCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

  if (abilities.length === 0) {
    Object.assign(minPartCounts, DEFAULT_DIAGNOSTIC_PART_COUNTS);
  } else {
    for (const ab of abilities) {
      const partNo = ab.partNumber && ab.partNumber >= 1 && ab.partNumber <= 7 ? ab.partNumber : 1;
      const minEvidence = ab.minEvidenceCount && ab.minEvidenceCount > 0 ? ab.minEvidenceCount : DEFAULT_MIN_EVIDENCE_COUNT;
      minPartCounts[partNo] = (minPartCounts[partNo] || 0) + minEvidence;
    }
  }

  const minRequiredTotal = Object.values(minPartCounts).reduce((sum, count) => sum + count, 0);
  const partCounts: Record<number, number> = { ...minPartCounts };

  if (targetTotal > minRequiredTotal) {
    const extraNeeded = targetTotal - minRequiredTotal;
    const totalEtsWeight = DEFAULT_EXAM_CONFIGS.FULL_MOCK_TEST.totalQuestions;
    const remainders: { partNumber: number; remainder: number }[] = [];
    let allocatedExtra = 0;

    for (const part of ETS_MOCK_TEST_MATRIX) {
      const exactShare = (extraNeeded * part.standardCount) / totalEtsWeight;
      const floorShare = Math.floor(exactShare);
      partCounts[part.partNumber] = (partCounts[part.partNumber] || 0) + floorShare;
      remainders.push({ partNumber: part.partNumber, remainder: exactShare - floorShare });
      allocatedExtra += floorShare;
    }

    const leftover = extraNeeded - allocatedExtra;
    remainders.sort((a, b) => b.remainder - a.remainder || a.partNumber - b.partNumber);
    for (let i = 0; i < leftover; i++) {
      const targetPart = remainders[i % remainders.length].partNumber;
      partCounts[targetPart] = (partCounts[targetPart] || 0) + 1;
    }
  }

  return {
    partCounts,
    minPartCounts,
    minRequiredTotal,
    isBelowMinimum: targetTotal > 0 && targetTotal < minRequiredTotal,
  };
}

