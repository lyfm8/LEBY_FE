import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import type { PartResponse, AbilityResponse } from '@/features/admin/part/types';
import type { QuestionFilterParams, QuestionStructureType } from '../types';

interface QuestionFilterBarProps {
    filters: QuestionFilterParams;
    onFilterChange: (filters: Partial<QuestionFilterParams>) => void;
    onReset: () => void;
    parts: PartResponse[];
    abilities: AbilityResponse[];
}

export const QuestionFilterBar: React.FC<QuestionFilterBarProps> = ({
    filters,
    onFilterChange,
    onReset,
    parts,
    abilities,
}) => {
    const activeTab = filters.structureType || 'ALL';

    const handleTabClick = (tab: QuestionStructureType) => {
        onFilterChange({ structureType: tab, page: 0 });
    };

    return (
        <div className="question-filter-card">
            {/* Hàng 1: Tabs phân loại cấu trúc câu hỏi & Nút đặt lại */}
            <div className="filter-top-row">
                <div className="question-tabs-nav">
                    <button
                        type="button"
                        className={`question-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
                        onClick={() => handleTabClick('ALL')}
                    >
                        <span>Tất cả câu hỏi</span>
                    </button>
                    <button
                        type="button"
                        className={`question-tab-btn ${activeTab === 'STANDALONE' ? 'active' : ''}`}
                        onClick={() => handleTabClick('STANDALONE')}
                    >
                        <span>Câu hỏi đơn</span>
                    </button>
                    <button
                        type="button"
                        className={`question-tab-btn ${activeTab === 'GROUP' ? 'active' : ''}`}
                        onClick={() => handleTabClick('GROUP')}
                    >
                        <span>Chùm câu hỏi</span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onReset}
                    className="btn-reset-filters"
                    title="Đặt lại toàn bộ bộ lọc về mặc định"
                >
                    <RotateCcw size={14} />
                    <span>Đặt lại bộ lọc</span>
                </button>
            </div>

            {/* Hàng 2: Bộ lọc đa tiêu chí (Tìm kiếm & các Dropdown) */}
            <div className="filter-grid-row">
                {/* Ô tìm kiếm theo tên hoặc nội dung */}
                <div className="filter-search-container">
                    <Search className="filter-search-icon" size={16} />
                    <input
                        type="text"
                        className="filter-search-input"
                        placeholder="Tìm theo tên, mã hoặc nội dung..."
                        value={filters.keyword || ''}
                        onChange={(e) => onFilterChange({ keyword: e.target.value, page: 0 })}
                    />
                </div>

                {/* Phần thi (Part 1 - 7) */}
                <div>
                    <select
                        className="filter-select"
                        value={filters.partId || ''}
                        onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            onFilterChange({ partId: val, abilityId: undefined, page: 0 });
                        }}
                    >
                        <option value="">Tất cả Parts (1 - 7)</option>
                        {parts.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.sections})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Năng lực đánh giá (Ability) */}
                <div>
                    <select
                        className="filter-select"
                        disabled={!filters.partId}
                        value={filters.abilityId || ''}
                        onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            onFilterChange({ abilityId: val, page: 0 });
                        }}
                    >
                        <option value="">
                            {filters.partId ? 'Tất cả năng lực' : 'Chọn Part trước'}
                        </option>
                        {abilities.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Độ khó (1 - 5) */}
                <div>
                    <select
                        className="filter-select"
                        value={filters.difficulty || ''}
                        onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            onFilterChange({ difficulty: val, page: 0 });
                        }}
                    >
                        <option value="">Mọi độ khó (1 - 5)</option>
                        <option value="1">1 - Rất dễ</option>
                        <option value="2">2 - Dễ</option>
                        <option value="3">3 - Vừa</option>
                        <option value="4">4 - Khó</option>
                        <option value="5">5 - Rất khó</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
