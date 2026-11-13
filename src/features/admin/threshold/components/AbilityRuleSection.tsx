import React, { useState, useMemo } from 'react';
import type { AbilityRuleRow } from '../types';
import { Award, Search, Filter, ArrowRight } from 'lucide-react';

interface AbilityRuleSectionProps {
  rows: AbilityRuleRow[];
  aimScore?: number;
  errors: Record<string, string>;
  onUpdateRow: (abilityId: number, value: number | null) => void;
}

export const AbilityRuleSection: React.FC<AbilityRuleSectionProps> = ({
  rows,
  aimScore,
  errors,
  onUpdateRow,
}) => {
  const [filterSection, setFilterSection] = useState<'ALL' | 'LISTENING' | 'READING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc theo section và từ khóa tìm kiếm
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchSection = filterSection === 'ALL' || row.section === filterSection;
      const matchSearch =
        searchTerm.trim() === '' ||
        row.abilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.partName && row.partName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSection && matchSearch;
    });
  }, [rows, filterSection, searchTerm]);

  return (
    <div className="threshold-card-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <div className="panel-icon-badge success">
            <Award size={18} />
          </div>
          <div>
            <h2 className="panel-title">Quy tắc Đánh giá Năng lực</h2>
            <p className="panel-subtitle">
              Cấu hình chuỗi ngưỡng: <strong>STABLE ➔ WEAK</strong> theo từng Năng lực vi mô —{' '}
              <strong>AIM {aimScore || 650}</strong>
            </p>
          </div>
        </div>

        {/* Thanh công cụ lọc nhanh */}
        <div className="panel-filters-bar">
          <div className="search-input-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm năng lực hoặc Part..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ability-search-input"
            />
          </div>

          <div className="filter-pill-group">
            <button
              type="button"
              className={`filter-pill-btn ${filterSection === 'ALL' ? 'is-active' : ''}`}
              onClick={() => setFilterSection('ALL')}
            >
              Tất cả ({rows.length})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterSection === 'LISTENING' ? 'is-active' : ''}`}
              onClick={() => setFilterSection('LISTENING')}
            >
              🎧 Listening
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterSection === 'READING' ? 'is-active' : ''}`}
              onClick={() => setFilterSection('READING')}
            >
              📖 Reading
            </button>
          </div>
        </div>
      </div>

      <div className="ability-rows-list">
        {filteredRows.map((ability) => {
          const rowError = errors[`ability_${ability.abilityId}`];

          return (
            <div
              key={ability.abilityId}
              className={`ability-flow-row ${rowError ? 'has-error' : ''}`}
            >
              {/* 1. Thông tin Năng lực */}
              <div className="ability-meta-block">
                <div className="ability-header-badges">
                  {ability.partName && (
                    <span className="ability-part-tag">{ability.partName}</span>
                  )}
                  <span className="ability-section-tag">
                    {ability.section === 'LISTENING' ? 'Listening' : 'Reading'}
                  </span>
                </div>
                <h3 className="ability-name">{ability.abilityName}</h3>
                {ability.abilityDescription && (
                  <p className="ability-desc">{ability.abilityDescription}</p>
                )}
              </div>

              {/* 2. Dòng tuần tự: STABLE - input - WEAK (Luôn giữ trên 1 dòng) */}
              <div className="threshold-flow-sequence is-single-line">
                {/* Mức 1: STABLE */}
                <div className="flow-node node-stable">
                  <span className="flow-badge badge-stable" title="Năng lực vững vàng: Miễn học module">
                    STABLE
                  </span>
                  <div className="flow-input-wrap">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="--"
                      value={ability.stableMin !== null && ability.stableMin !== undefined ? ability.stableMin : ''}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        if (raw === '') {
                          onUpdateRow(ability.abilityId, null);
                        } else {
                          const val = parseFloat(raw);
                          onUpdateRow(ability.abilityId, isNaN(val) ? null : val);
                        }
                      }}
                      className="flow-number-input"
                    />
                    <span className="unit-symbol">%</span>
                  </div>
                </div>

                <ArrowRight size={14} className="flow-arrow" />

                {/* Mức 2: WEAK (Khoảng tự động dưới STABLE) */}
                <div className="flow-node node-weak">
                  <span className="flow-badge badge-weak" title="Cần học bổ trợ: Bốc module vào lộ trình">
                    WEAK
                  </span>
                  <div className="flow-result-chip">
                    {ability.stableMin !== null && ability.stableMin !== undefined
                      ? `< ${ability.stableMin}%`
                      : '< --%'}
                  </div>
                </div>
              </div>

              {rowError && <div className="row-logic-error">{rowError}</div>}
            </div>
          );
        })}

        {filteredRows.length === 0 && (
          <div className="empty-filter-state">
            <Filter size={24} />
            <p>Không tìm thấy năng lực nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      {/* Chú thích chân trang */}
      <div className="panel-footer-legend">
        <div className="legend-item">
          <span className="legend-bullet green" />
          <span><strong>STABLE (≥ Ngưỡng Đạt):</strong> Năng lực thành thạo ➔ Miễn học module liên kết</span>
        </div>
        <div className="legend-item">
          <span className="legend-bullet red" />
          <span><strong>WEAK (&lt; Ngưỡng Đạt):</strong> Cần bổ trợ ➔ Bốc module vào lộ trình học</span>
        </div>
      </div>
    </div>
  );
};
