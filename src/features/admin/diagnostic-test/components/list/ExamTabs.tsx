import React from 'react';
import type { ExamType } from '../../types';

interface ExamTabsProps {
  currentTab: 'ALL' | ExamType;
  counts: { all: number; diagnostic: number; mock: number };
  onChange: (tab: 'ALL' | ExamType) => void;
}

/**
 * Thanh Tabs phân loại đề thi với bộ đếm số lượng tương ứng.
 */
export const ExamTabs: React.FC<ExamTabsProps> = ({ currentTab, counts, onChange }) => {
  return (
    <div className="exam-tabs-container">
      <button
        type="button"
        className={`exam-tab-item ${currentTab === 'ALL' ? 'active' : ''}`}
        onClick={() => onChange('ALL')}
      >
        <span>Tất cả đề thi</span>
        <span className="exam-tab-count">{counts.all}</span>
      </button>

      <button
        type="button"
        className={`exam-tab-item ${currentTab === 'DIAGNOSTIC' ? 'active' : ''}`}
        onClick={() => onChange('DIAGNOSTIC')}
      >
        <span>Đề thi chẩn đoán</span>
        <span className="exam-tab-count">{counts.diagnostic}</span>
      </button>

      <button
        type="button"
        className={`exam-tab-item ${currentTab === 'FULL_MOCK_TEST' ? 'active' : ''}`}
        onClick={() => onChange('FULL_MOCK_TEST')}
      >
        <span>Đề thi thử</span>
        <span className="exam-tab-count">{counts.mock}</span>
      </button>
    </div>
  );
};

