import type { AbilityAvailabilityItem, ChecklistItemStatus, ExamQuestionItem, ExamType } from '../types';
import { ETS_MOCK_TEST_MATRIX } from './matrixConstants';

export interface ValidationParams {
  testType: ExamType;
  title: string;
  durationMinutes: number;
  selectedQuestions: ExamQuestionItem[];
  allDbAbilities: AbilityAvailabilityItem[];
  targetTotalQuestions?: number;
  matrixCounts?: Record<number, number>;
}

export interface ValidationResult {
  checklist: ChecklistItemStatus[];
  passedCount: number;
  totalCount: number;
  isAllPassed: boolean;
  canSaveOfficial: boolean; // Chỉ cho phép Lưu đề thi hoàn tất khi isAllPassed = true
}

/**
 * Kiểm tra các tiêu chuẩn của bộ đề thi trước khi cho phép lưu.
 * Áp dụng 2 bộ tiêu chuẩn khác nhau cho Đề thi thử (Mock Test) và Đề chẩn đoán (Diagnostic).
 */
export function validateExamBeforeSave(params: ValidationParams): ValidationResult {
  const { testType, title, durationMinutes, selectedQuestions, allDbAbilities, targetTotalQuestions, matrixCounts } = params;

  if (testType === 'FULL_MOCK_TEST') {
    return validateMockTest(title, durationMinutes, selectedQuestions, matrixCounts);
  } else {
    return validateDiagnosticTest(title, durationMinutes, selectedQuestions, allDbAbilities, targetTotalQuestions);
  }
}

/**
 * Tiêu chuẩn nghiệm thu Đề thi thử tổng hợp (Mock Test 200 câu).
 */
function validateMockTest(
  title: string,
  durationMinutes: number,
  selectedQuestions: ExamQuestionItem[],
  matrixCounts?: Record<number, number>
): ValidationResult {
  // 1. Tên đề thi
  const hasTitle = title.trim().length >= 3;

  // Đếm theo Listening / Reading
  let listeningCount = 0;
  let readingCount = 0;
  const partCountMap: Record<number, number> = {};

  if (matrixCounts) {
    for (let p = 1; p <= 4; p++) listeningCount += matrixCounts[p] || 0;
    for (let p = 5; p <= 7; p++) readingCount += matrixCounts[p] || 0;
    Object.assign(partCountMap, matrixCounts);
  } else {
    for (const q of selectedQuestions) {
      const part = q.partNumber || 1;
      partCountMap[part] = (partCountMap[part] || 0) + 1;
      if (q.section === 'LISTENING' || (part >= 1 && part <= 4)) {
        listeningCount++;
      } else {
        readingCount++;
      }
    }
  }

  // 2. Đủ 100 câu Listening
  const hasEnoughListening = listeningCount === 100;

  // 3. Đủ 100 câu Reading
  const hasEnoughReading = readingCount === 100;

  // 4. Phân bổ đúng theo từng Part
  const isPartDistributionValid = ETS_MOCK_TEST_MATRIX.every(
    (cfg) => (partCountMap[cfg.partNumber] || 0) === cfg.standardCount
  );

  // 5. Part 7 đúng cơ cấu đoạn đọc
  const isPart7Valid = (partCountMap[7] || 0) === 54;

  // 6. Thời gian làm bài hợp lệ
  const isDurationValid = durationMinutes > 0 && durationMinutes <= 240;

  const checklist: ChecklistItemStatus[] = [
    {
      id: 'mock-title',
      label: 'Đã có tên đề thi',
      isPassed: hasTitle,
      message: hasTitle ? undefined : 'Tên đề thi cần tối thiểu 3 ký tự',
    },
    {
      id: 'mock-listening',
      label: 'Đủ 100 câu Listening',
      isPassed: hasEnoughListening,
      message: hasEnoughListening ? undefined : `Hiện có ${listeningCount}/100 câu Listening`,
    },
    {
      id: 'mock-reading',
      label: 'Đủ 100 câu Reading',
      isPassed: hasEnoughReading,
      message: hasEnoughReading ? undefined : `Hiện có ${readingCount}/100 câu Reading`,
    },
    {
      id: 'mock-parts',
      label: 'Phân bổ đúng theo từng Part',
      isPassed: isPartDistributionValid,
      message: isPartDistributionValid ? undefined : 'Số lượng câu hỏi chưa khớp ma trận 7 Part',
    },
    {
      id: 'mock-part7',
      label: 'Part 7 đúng cơ cấu đoạn đọc (54 câu)',
      isPassed: isPart7Valid,
      message: isPart7Valid ? undefined : `Part 7 hiện có ${partCountMap[7] || 0}/54 câu`,
    },
    {
      id: 'mock-duration',
      label: 'Thời gian làm bài hợp lệ',
      isPassed: isDurationValid,
      message: isDurationValid ? undefined : 'Thời gian phải lớn hơn 0 phút',
    },
  ];

  const passedCount = checklist.filter((c) => c.isPassed).length;
  const isAllPassed = passedCount === checklist.length;

  return {
    checklist,
    passedCount,
    totalCount: checklist.length,
    isAllPassed,
    canSaveOfficial: isAllPassed,
  };
}

/**
 * Tiêu chuẩn nghiệm thu Đề thi chẩn đoán (Diagnostic Test).
 * QUY TẮC ĐẶC THÙ: Bắt buộc phải bao phủ toàn bộ Ability trong database!
 */
function validateDiagnosticTest(
  title: string,
  durationMinutes: number,
  selectedQuestions: ExamQuestionItem[],
  allDbAbilities: AbilityAvailabilityItem[],
  targetTotalQuestions: number = 60
): ValidationResult {
  // 1. Tên đề thi
  const hasTitle = title.trim().length >= 3;

  // 2. Thời gian làm bài hợp lệ
  const isDurationValid = durationMinutes > 0 && durationMinutes <= 120;

  // 3. Số lượng câu hỏi đạt yêu cầu theo số lượng đã thiết lập
  const totalQuestions = selectedQuestions.length;
  const target = targetTotalQuestions > 0 ? targetTotalQuestions : 60;
  const hasEnoughQuestions = totalQuestions === target;

  // 4. BAO PHỦ TOÀN BỘ ABILITY TRONG DATABASE
  const coveredAbilityNames = new Set<string>();
  for (const q of selectedQuestions) {
    if (q.abilityNames) {
      for (const ab of q.abilityNames) {
        coveredAbilityNames.add(ab.trim().toLowerCase());
      }
    }
  }

  // So sánh với danh sách Ability trong DB
  const totalDbAbilitiesCount = allDbAbilities.length;
  let coveredCount = 0;
  if (totalDbAbilitiesCount > 0) {
    for (const ab of allDbAbilities) {
      if (coveredAbilityNames.has(ab.name.trim().toLowerCase())) {
        coveredCount++;
      }
    }
  }

  const isAllAbilitiesCovered = totalDbAbilitiesCount === 0 || coveredCount >= totalDbAbilitiesCount;

  // 5. Cân đối Listening và Reading
  let listeningCount = 0;
  let readingCount = 0;
  for (const q of selectedQuestions) {
    const part = q.partNumber || 1;
    if (q.section === 'LISTENING' || (part >= 1 && part <= 4)) {
      listeningCount++;
    } else {
      readingCount++;
    }
  }
  const isBalanced = listeningCount > 0 && readingCount > 0;

  const checklist: ChecklistItemStatus[] = [
    {
      id: 'diag-title',
      label: 'Đã có tên đề thi',
      isPassed: hasTitle,
      message: hasTitle ? undefined : 'Tên đề thi cần tối thiểu 3 ký tự',
    },
    {
      id: 'diag-duration',
      label: 'Thời gian làm bài hợp lệ',
      isPassed: isDurationValid,
      message: isDurationValid ? undefined : 'Thời gian làm bài phải từ 1 đến 120 phút',
    },
    {
      id: 'diag-questions',
      label: `Đủ số lượng câu hỏi (${totalQuestions}/${target} câu)`,
      isPassed: hasEnoughQuestions,
      message: hasEnoughQuestions
        ? undefined
        : totalQuestions < target
        ? `Cần chọn thêm ${target - totalQuestions} câu hỏi nữa`
        : `Đã chọn thừa ${totalQuestions - target} câu so với mục tiêu`,
    },
    {
      id: 'diag-abilities',
      label: `Bao phủ toàn bộ Kỹ năng (${coveredCount}/${totalDbAbilitiesCount} Abilities)`,
      isPassed: isAllAbilitiesCovered,
      message: isAllAbilitiesCovered
        ? undefined
        : `Còn thiếu ${totalDbAbilitiesCount - coveredCount} kỹ năng chưa có câu hỏi đánh giá`,
    },
    {
      id: 'diag-balance',
      label: `Cân đối cả Listening (${listeningCount}) và Reading (${readingCount})`,
      isPassed: isBalanced,
      message: isBalanced ? undefined : 'Đề chẩn đoán cần có cả câu hỏi Listening và Reading',
    },
  ];

  const passedCount = checklist.filter((c) => c.isPassed).length;
  const isAllPassed = passedCount === checklist.length;

  return {
    checklist,
    passedCount,
    totalCount: checklist.length,
    isAllPassed,
    canSaveOfficial: isAllPassed,
  };
}

