import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import type { ExamStatus, ExamType } from '../../types';

interface ExamFilterBarProps {
  keyword: string;
  status: ExamStatus | 'ALL';
  testType: ExamType | 'ALL';
  onKeywordChange: (val: string) => void;
  onStatusChange: (val: ExamStatus | 'ALL') => void;
  onTypeChange: (val: ExamType | 'ALL') => void;
  onReset: () => void;
}

/**
 * Thanh tìm kiếm và bộ lọc trạng thái, loại đề thi.
 */
export const ExamFilterBar: React.FC<ExamFilterBarProps> = ({
  keyword,
  status,
  testType,
  onKeywordChange,
  onStatusChange,
  onTypeChange,
  onReset,
}) => {
  return (
    <div className="exam-filter-bar">
      <div className="exam-search-input-wrap">
        <Search className="exam-search-icon" size={18} />
        <input
          type="text"
          className="exam-search-input"
          placeholder="Tìm kiếm theo tên đề thi..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>

      <select
        className="exam-select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ExamStatus | 'ALL')}
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="ACTIVE">Active</option>
        <option value="ARCHIVE">Archive</option>
        <option value="DRAFT">Draft</option>
      </select>

      <select
        className="exam-select"
        value={testType}
        onChange={(e) => onTypeChange(e.target.value as ExamType | 'ALL')}
      >
        <option value="ALL">Tất cả loại đề</option>
        <option value="DIAGNOSTIC">Đề thi chẩn đoán</option>
        <option value="FULL_MOCK_TEST">Đề thi thử (Mock Test)</option>
      </select>

      <button type="button" className="exam-btn-reset" onClick={onReset} title="Đặt lại bộ lọc">
        <RotateCcw size={15} />
        <span>Đặt lại</span>
      </button>
    </div>
  );
};

