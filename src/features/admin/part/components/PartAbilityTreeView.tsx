import React, { useState, useMemo } from 'react';
import type { PartResponse, AbilityResponse, PartSectionType } from '../types';
import { SectionBadge } from './SectionBadge';
import { ChevronDown, ChevronRight, BookOpen, Brain } from 'lucide-react';

/**
 * Component hiển thị trực quan cây phân cấp Part → Ability.
 * Nhóm theo Section (LISTENING / READING), mỗi Part có thể mở/gập danh sách Ability con.
 */

interface PartAbilityTreeViewProps {
  parts: PartResponse[];
  /** Map partId -> danh sách Ability đã load */
  abilitiesMap: Record<number, AbilityResponse[]>;
  /** Gọi khi cần load abilities cho một Part chưa có trong map */
  onLoadAbilities: (partId: number) => void;
  isLoading: boolean;
}

// Nhóm Parts theo Section để hiển thị cây 2 nhánh chính
function groupBySection(parts: PartResponse[]): Record<PartSectionType, PartResponse[]> {
  const result: Record<PartSectionType, PartResponse[]> = { LISTENING: [], READING: [] };
  for (const p of parts) {
    result[p.sections]?.push(p);
  }
  return result;
}

export const PartAbilityTreeView: React.FC<PartAbilityTreeViewProps> = ({
  parts,
  abilitiesMap,
  onLoadAbilities,
  isLoading,
}) => {
  // Track mở/gập theo partId
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set());

  const grouped = useMemo(() => groupBySection(parts), [parts]);

  const togglePart = (partId: number) => {
    setExpandedParts(prev => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
        // Tự động load abilities nếu chưa có
        if (!abilitiesMap[partId]) {
          onLoadAbilities(partId);
        }
      }
      return next;
    });
  };

  if (isLoading) {
    return <div className="tree-view-loading">Đang tải...</div>;
  }

  if (parts.length === 0) {
    return <div className="tree-view-empty">Chưa có Part nào</div>;
  }

  const sectionOrder: PartSectionType[] = ['LISTENING', 'READING'];

  return (
    <div className="tree-view-container">
      {sectionOrder.map(section => {
        const sectionParts = grouped[section];
        if (sectionParts.length === 0) return null;

        return (
          <div key={section} className="tree-section">
            {/* Nhánh Section */}
            <div className="tree-section-header">
              <SectionBadge section={section} />
              <span className="tree-section-count">({sectionParts.length} parts)</span>
            </div>

            {/* Các Part con */}
            <div className="tree-section-children">
              {sectionParts.map(part => {
                const isExpanded = expandedParts.has(part.id);
                const abilities = abilitiesMap[part.id] || [];

                return (
                  <div key={part.id} className="tree-part-node">
                    {/* Nhánh Part - bấm để mở/gập */}
                    <div
                      className={`tree-part-header ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => togglePart(part.id)}
                    >
                      <span className="tree-toggle">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <BookOpen size={16} className="tree-part-icon" />
                      <span className="tree-part-name">{part.name}</span>
                      <span className="tree-ability-count">
                        {abilities.length > 0 ? `${abilities.length} năng lực` : ''}
                      </span>
                    </div>

                    {/* Danh sách Ability con (chỉ hiện khi mở) */}
                    {isExpanded && (
                      <div className="tree-ability-list">
                        {abilities.length === 0 ? (
                          <div className="tree-ability-empty">Chưa có năng lực nào</div>
                        ) : (
                          abilities.map(ability => (
                            <div key={ability.id} className="tree-ability-node">
                              <span className="tree-connector">└─</span>
                              <Brain size={14} className="tree-ability-icon" />
                              <span className="tree-ability-name">{ability.name}</span>
                              {ability.description && (
                                <span className="tree-ability-desc">– {ability.description}</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

