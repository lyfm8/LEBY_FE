import React from 'react';
import type { AbilityResponse } from '@/features/admin/part/types';

interface AbilityPickerProps {
    abilities: AbilityResponse[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    isLoading?: boolean;
    error?: string;
}

export const AbilityPicker: React.FC<AbilityPickerProps> = ({
    abilities,
    selectedIds,
    onChange,
    isLoading = false,
    error,
}) => {
    const handleToggle = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((item) => item !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#111827', margin: 0 }}>
                    Năng lực đánh giá (Ability) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{selectedIds.length} đã chọn</span>
            </div>

            {isLoading ? (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', padding: '0.5rem 0' }}>
                    Đang tải danh sách kỹ năng của Part...
                </div>
            ) : abilities.length === 0 ? (
                <div
                    style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        padding: '0.875rem',
                        border: '1px dashed #d1d5db',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                    }}
                >
                    Vui lòng chọn Phần thi (Part) ở trên để hiển thị danh sách kỹ năng tương ứng.
                </div>
            ) : (
                <div
                    style={{
                        maxHeight: '180px',
                        overflowY: 'auto',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.375rem',
                    }}
                >
                    {abilities.map((ability) => {
                        const isChecked = selectedIds.includes(ability.id);
                        return (
                            <label
                                key={ability.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.5rem',
                                    padding: '0.375rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    fontSize: '0.8125rem',
                                    backgroundColor: isChecked ? '#fff7ed' : 'transparent',
                                    transition: 'background-color 0.15s',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    style={{ marginTop: '0.2rem', accentColor: '#ea580c', cursor: 'pointer' }}
                                    checked={isChecked}
                                    onChange={() => handleToggle(ability.id)}
                                />
                                <div>
                                    <div style={{ fontWeight: isChecked ? 600 : 500, color: isChecked ? '#c2410c' : '#1f2937' }}>
                                        {ability.name}
                                    </div>
                                    {ability.description && (
                                        <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                                            {ability.description}
                                        </div>
                                    )}
                                </div>
                            </label>
                        );
                    })}
                </div>
            )}

            {error && <div className="form-error">{error}</div>}
        </div>
    );
};
