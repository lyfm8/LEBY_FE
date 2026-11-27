import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ValidationResult } from '../../utils/checklistValidation';

interface ChecklistCardProps {
  validationResult: ValidationResult;
}

/**
 * Card hiển thị thanh tiến trình và danh sách checklist các tiêu chí trước khi lưu.
 */
export const ChecklistCard: React.FC<ChecklistCardProps> = ({ validationResult }) => {
  const { checklist, passedCount, totalCount, isAllPassed } = validationResult;
  const progressPercent = Math.round((passedCount / totalCount) * 100);

  return (
    <div className="checklist-card">
      <div className="checklist-title-wrap">
        <span className="checklist-title">Kiểm tra trước khi lưu</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: isAllPassed ? '#16A34A' : '#D97706' }}>
          {passedCount}/{totalCount} đạt
        </span>
      </div>

      {/* Progress Bar */}
      <div className="checklist-progress-bar-bg">
        <div
          className="checklist-progress-bar-fill"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: isAllPassed ? '#16A34A' : '#F59E0B',
          }}
        />
      </div>

      {/* Danh sách tiêu chí */}
      <div className="checklist-items-list">
        {checklist.map((item) => (
          <div key={item.id} className={`checklist-item ${item.isPassed ? 'passed' : 'failed'}`}>
            <CheckCircle2
              size={16}
              className={item.isPassed ? 'text-green-600 flex-shrink-0' : 'text-slate-300 flex-shrink-0'}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: item.isPassed ? 500 : 400 }}>{item.label}</span>
              {item.message && (
                <span style={{ fontSize: '11px', color: '#D97706', marginTop: '2px' }}>
                  {item.message}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Thông báo trạng thái cuối */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
        {isAllPassed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
            <CheckCircle2 size={15} />
            <span>Tất cả điều kiện đã được đáp ứng</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#D97706', fontWeight: 500 }}>
            <AlertTriangle size={15} />
            <span>Còn một số trường chưa hoàn tất</span>
          </div>
        )}
      </div>
    </div>
  );
};

