import React from 'react';
import type { PartSectionType } from '../types';

/**
 * Nhãn hiển thị loại kỹ năng TOEIC (LISTENING / READING) với thiết kế badge pill chuẩn mực.
 */

interface SectionBadgeProps {
  section: PartSectionType;
  showIcon?: boolean;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({ section }) => {
  const isListening = section === 'LISTENING';

  return (
    <span className={`section-badge-pill ${isListening ? 'listening' : 'reading'}`}>
      <span>{isListening ? 'Listening' : 'Reading'}</span>
    </span>
  );
};

