import React, { useState, useEffect, useMemo } from 'react';
import type { PartResponse, AbilityResponse, PartSectionType } from '../types';
import { SectionBadge } from './SectionBadge';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Brain,
  Headphones,
  Layers,
  Search,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';

interface PartAbilityTreeViewProps {
  parts: PartResponse[];
  /** Map partId -> danh sách Ability */
  abilitiesMap: Record<number, AbilityResponse[]>;
  /** Gọi khi cần load abilities cho một Part chưa có trong map */
  onLoadAbilities: (partId: number) => void;
  isLoading: boolean;
}

function groupBySection(parts: PartResponse[]): Record<PartSectionType, PartResponse[]> {
  const result: Record<PartSectionType, PartResponse[]> = { LISTENING: [], READING: [] };
  for (const p of parts) {
    if (result[p.sections]) {
      result[p.sections].push(p);
    }
  }
  return result;
}

export const PartAbilityTreeView: React.FC<PartAbilityTreeViewProps> = ({
  parts,
  abilitiesMap,
  onLoadAbilities,
  isLoading,
}) => {
  // Mở rộng tất cả các Part mặc định ngay từ đầu
  const [expandedParts, setExpandedParts] = useState<Set<number>>(() => new Set(parts.map((p) => p.id)));
  const [keyword, setKeyword] = useState<string>('');

  // Khi danh sách parts tải xong, tự động mở bung toàn bộ cây
  useEffect(() => {
    if (parts.length > 0) {
      setExpandedParts((prev) => {
        const next = new Set(prev);
        parts.forEach((p) => next.add(p.id));
        return next;
      });
      // Đảm bảo mọi part đều được load abilities
      parts.forEach((p) => {
        if (!abilitiesMap[p.id]) {
          onLoadAbilities(p.id);
        }
      });
    }
  }, [parts, abilitiesMap, onLoadAbilities]);

  const togglePart = (partId: number) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
        if (!abilitiesMap[partId]) {
          onLoadAbilities(partId);
        }
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedParts(new Set(parts.map((p) => p.id)));
  };

  const handleCollapseAll = () => {
    setExpandedParts(new Set());
  };

  // Tính tổng số năng lực trong toàn bộ hệ thống
  const totalAbilitiesCount = useMemo(() => {
    return Object.values(abilitiesMap).reduce((sum, list) => sum + list.length, 0);
  }, [abilitiesMap]);

  // Lọc theo từ khóa tìm kiếm
  const filteredParts = useMemo(() => {
    if (!keyword.trim()) return parts;
    const lower = keyword.toLowerCase();
    return parts.filter((part) => {
      const partMatches = part.name.toLowerCase().includes(lower) || (part.description && part.description.toLowerCase().includes(lower));
      const abilities = abilitiesMap[part.id] || [];
      const abilityMatches = abilities.some(
        (ab) => ab.name.toLowerCase().includes(lower) || (ab.description && ab.description.toLowerCase().includes(lower))
      );
      return partMatches || abilityMatches;
    });
  }, [parts, keyword, abilitiesMap]);

  const grouped = useMemo(() => groupBySection(filteredParts), [filteredParts]);

  if (isLoading) {
    return (
      <div className="tree-view-state-card">
        <div className="loading-spinner" />
        <p>Đang tải cấu trúc cây phân cấp...</p>
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="tree-view-state-card">
        <Layers size={36} className="text-muted" />
        <p className="font-semibold text-dark">Chưa có phần thi nào</p>
        <p className="text-sm text-muted">Vui lòng quay lại chế độ Quản trị để thêm phần thi mới.</p>
      </div>
    );
  }

  const sectionOrder: PartSectionType[] = ['LISTENING', 'READING'];

  return (
    <div className="tree-view-container">
      {/* Thanh công cụ tìm kiếm và mở/gập nhanh */}
      <div className="tree-view-toolbar">
        <div className="tree-toolbar-left">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm phần thi hoặc năng lực..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="tree-meta-summary">
            <span className="summary-pill">
              <strong>{parts.length}</strong> Phần thi
            </span>
            <span className="summary-divider">•</span>
            <span className="summary-pill">
              <strong>{totalAbilitiesCount}</strong> Năng lực đánh giá
            </span>
          </div>
        </div>

        <div className="tree-toolbar-right">
          <button
            type="button"
            className="btn-toolbar"
            onClick={handleExpandAll}
            title="Mở bung toàn bộ các nhánh"
          >
            <ChevronsDown size={14} />
            <span>Mở rộng tất cả</span>
          </button>
          <button
            type="button"
            className="btn-toolbar"
            onClick={handleCollapseAll}
            title="Thu gọn toàn bộ các nhánh"
          >
            <ChevronsUp size={14} />
            <span>Thu gọn tất cả</span>
          </button>
        </div>
      </div>

      {/* Nội dung danh sách cây */}
      <div className="tree-sections-flow">
        {sectionOrder.map((section) => {
          const sectionParts = grouped[section];
          if (!sectionParts || sectionParts.length === 0) return null;

          const isListening = section === 'LISTENING';

          return (
            <div key={section} className="tree-section-block">
              {/* Tiêu đề Phân loại Section */}
              <div className={`tree-section-banner ${isListening ? 'listening' : 'reading'}`}>
                <div className="section-banner-title">
                  {isListening ? (
                    <Headphones size={17} className="banner-icon" />
                  ) : (
                    <BookOpen size={17} className="banner-icon" />
                  )}
                  <span className="banner-name">
                    {isListening ? 'Kỹ năng Nghe (LISTENING)' : 'Kỹ năng Đọc (READING)'}
                  </span>
                  <span className="banner-count-badge">
                    {sectionParts.length} phần thi
                  </span>
                </div>
              </div>

              {/* Danh sách các Part thuộc Section */}
              <div className="tree-section-body">
                {sectionParts.map((part) => {
                  const isExpanded = expandedParts.has(part.id);
                  const abilities = abilitiesMap[part.id] || [];

                  // Nếu đang lọc keyword, lọc danh sách abilities hiển thị tương ứng
                  const displayedAbilities = keyword.trim()
                    ? abilities.filter(
                        (ab) =>
                          ab.name.toLowerCase().includes(keyword.toLowerCase()) ||
                          (ab.description && ab.description.toLowerCase().includes(keyword.toLowerCase())) ||
                          part.name.toLowerCase().includes(keyword.toLowerCase())
                      )
                    : abilities;

                  return (
                    <div key={part.id} className="tree-part-card">
                      {/* Header của Part */}
                      <div
                        className={`tree-part-header ${isExpanded ? 'active-header' : ''}`}
                        onClick={() => togglePart(part.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="part-header-left">
                          <button
                            type="button"
                            className="part-chevron-btn"
                            aria-label={isExpanded ? 'Thu gọn Part' : 'Mở rộng Part'}
                            tabIndex={-1}
                          >
                            {isExpanded ? (
                              <ChevronDown size={15} className="chevron-icon" />
                            ) : (
                              <ChevronRight size={15} className="chevron-icon" />
                            )}
                          </button>

                          <div className="part-icon-box">
                            <Layers size={15} />
                          </div>

                          <div className="part-info-group">
                            <span className="part-name-text">{part.name}</span>
                            {part.description && (
                              <span className="part-desc-preview">{part.description}</span>
                            )}
                          </div>
                        </div>

                        <div className="part-header-right">
                          <SectionBadge section={part.sections} />
                          <span className="part-ability-pill">
                            {abilities.length} năng lực
                          </span>
                        </div>
                      </div>

                      {/* Danh sách năng lực con (Abilities) */}
                      {isExpanded && (
                        <div className="tree-abilities-branch">
                          {displayedAbilities.length === 0 ? (
                            <div className="tree-empty-abilities">
                              <Brain size={16} className="text-muted" />
                              <span>Chưa có năng lực nào trong phần thi này.</span>
                            </div>
                          ) : (
                            <div className="tree-abilities-grid">
                              {displayedAbilities.map((ab) => (
                                <div key={ab.id} className="tree-ability-card">
                                  <div className="ability-card-header">
                                    <div className="ability-card-left">
                                      <div className="ability-icon-circle">
                                        <Brain size={13} />
                                      </div>
                                      <span className="ability-card-name">{ab.name}</span>
                                    </div>
                                    <SectionBadge section={ab.sections} showIcon={false} />
                                  </div>

                                  {ab.description && (
                                    <p className="ability-card-desc">{ab.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
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
    </div>
  );
};
