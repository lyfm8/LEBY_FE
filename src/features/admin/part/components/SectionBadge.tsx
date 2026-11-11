import React from 'react';
import type { PartSectionType } from '../types';
import { Headphones, BookOpen } from 'lucide-react';

/**
 * Nhãn hiển thị loại kỹ năng TOEIC (LISTENING / READING) với thiết kế badge pill chuẩn mực.
 * Hỗ trợ hiển thị icon trực quan (tai nghe / cuốn sách).
 */

interface SectionBadgeProps {
  section: PartSectionType;
  showIcon?: boolean;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({ section, showIcon = true }) => {
  const isListening = section === 'LISTENING';

  return (
    <span className={`section-badge-pill ${isListening ? 'listening' : 'reading'}`}>
      {showIcon && (isListening ? <Headphones size={11} strokeWidth={2.2} /> : <BookOpen size={11} strokeWidth={2.2} />)}
      <span>{isListening ? 'Listening' : 'Reading'}</span>
    </span>
  );
};
