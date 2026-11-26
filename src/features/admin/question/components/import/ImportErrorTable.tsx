import React from 'react';
import { AlertTriangle, Download, Loader2 } from 'lucide-react';
import type { ImportRowError } from '../../types';

interface ImportErrorTableProps {
    errors: ImportRowError[];
    isDownloadingReport: boolean;
    onDownloadReport: () => void;
}

/**
 * Bảng báo cáo chi tiết từng dòng lỗi khi kiểm tra file Excel thất bại (All-or-Nothing).
 */
export const ImportErrorTable: React.FC<ImportErrorTableProps> = ({
    errors,
    isDownloadingReport,
    onDownloadReport,
}) => {
    if (!errors || errors.length === 0) return null;

    return (
        <div className="import-error-panel">
            <div className="import-error-header">
                <div className="import-error-summary">
                    <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem' }}>
                            Từ chối import — Phát hiện {errors.length} dòng chứa dữ liệu chưa hợp lệ
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.15rem' }}>
                            Hệ thống chưa lưu câu hỏi nào vào ngân hàng. Vui lòng sửa các dòng bên dưới rồi tải lên lại.
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn-secondary"
                    style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.75rem',
                        borderColor: '#fca5a5',
                        color: '#991b1b',
                        flexShrink: 0,
                    }}
                    onClick={onDownloadReport}
                    disabled={isDownloadingReport}
                >
                    {isDownloadingReport ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Download size={14} />
                    )}
                    <span>Tải báo cáo lỗi (.xlsx)</span>
                </button>
            </div>

            <div className="import-error-table-wrap">
                <table className="import-error-table">
                    <thead>
                        <tr>
                            <th>Sheet</th>
                            <th>Dòng</th>
                            <th>Mã chùm</th>
                            <th>Tên câu hỏi</th>
                            <th>Chi tiết lỗi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {errors.map((err, idx) => (
                            <tr key={`${err.sheet}-${err.rowNumber}-${idx}`}>
                                <td>
                                    <span className="import-sheet-badge">{err.sheet}</span>
                                </td>
                                <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    Dòng {err.rowNumber}
                                </td>
                                <td>{err.groupRowId || '—'}</td>
                                <td>
                                    <div className="import-err-name" title={err.questionName}>
                                        {err.questionName || '—'}
                                    </div>
                                </td>
                                <td>
                                    <ul className="import-err-list">
                                        {err.messages.map((msg, mIdx) => (
                                            <li key={mIdx}>{msg}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
