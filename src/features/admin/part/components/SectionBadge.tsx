import React from 'react';
import type { PartSectionType } from '../types';

/**
 * Nhãn hiển thị loại kỹ năng TOEIC (LISTENING / READING) với màu sắc phân biệt.
 * Dùng chung cho PartList, AbilityList, TreeView.
 */

const SECTION_STYLES: Record<PartSectionType, { bg: string; color: string }> = {
  LISTENING: { bg: '#dbeafe', color: '#1e40af' },
  READING: { bg: '#fef3c7', color: '#92400e' },
};

interface SectionBadgeProps {
  section: PartSectionType;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({ section }) => {
  const style = SECTION_STYLES[section];
  return (
    <span
      className="section-badge"
      style={{
        display: 'inline-block',
        fontSize: '0.7rem',
        fontWeight: 600,
        padding: '0.15rem 0.4rem',
        borderRadius: '0.25rem',
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {section}
    </span>
  );
};

