import React, { useEffect, useRef } from 'react';
import {
    AlertCircle,
    Download,
    FileSpreadsheet,
    ImagePlus,
    Loader2,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';
import { useImportQuestions } from '../../hooks/useImportQuestions';
import { ImportErrorTable } from './ImportErrorTable';

interface ImportQuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onOpenMediaModal: () => void;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
}

/**
 * Modal Import hàng loạt câu hỏi TOEIC (Câu hỏi đơn & Chùm câu hỏi) từ tệp Excel .xlsx.
 */
export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onOpenMediaModal,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        selectedFile,
        fileError,
        isDownloadingTemplate,
        isImporting,
        isDownloadingReport,
        importResult,
        handleFileSelect,
        handleDownloadTemplate,
        handleImport,
        handleDownloadErrorReport,
        handleReset,
    } = useImportQuestions(onSuccess, onClose);

    useEffect(() => {
        if (!isOpen) {
            handleReset();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [isOpen, handleReset]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (isImporting) return;
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileSelect(file);
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 55 }} onClick={handleClose}>
            <div
                className="modal-content large import-questions-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header" style={{ marginBottom: '1rem' }}>
                    <div>
                        <h3 className="modal-title">Nhập hàng loạt câu hỏi từ tệp Excel</h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: '#6b7280' }}>
                            Hỗ trợ nhập đồng thời cả câu hỏi đơn (Part 1, 2, 5) và chùm câu hỏi (Part 3, 4, 6, 7).
                        </p>
                    </div>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={handleClose}
                        disabled={isImporting}
                        title="Đóng"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="import-modal-body">
                    {/* Bước 1 & Bước 2 */}
                    <div className="import-steps-grid">
                        <div className="import-step-card">
                            <div className="import-step-badge">Bước 1</div>
                            <h4 className="import-step-title">Upload Media lên Cloudinary</h4>
                            <p className="import-step-desc">
                                Tải trước tệp âm thanh (Part 1–4) hoặc ảnh (Part 1, 7) để lấy <strong>Media ID</strong> điền vào Excel.
                            </p>
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ marginTop: 'auto', width: '100%' }}
                                onClick={onOpenMediaModal}
                                disabled={isImporting}
                            >
                                <ImagePlus size={15} />
                                <span>Upload media</span>
                            </button>
                        </div>

                        <div className="import-step-card">
                            <div className="import-step-badge">Bước 2</div>
                            <h4 className="import-step-title">Tải biểu mẫu Excel chuẩn</h4>
                            <p className="import-step-desc">
                                Tệp mẫu gồm 2 sheet nhập liệu với tên cột thân thiện và sheet tra cứu mã Part / Ability thực tế.
                            </p>
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ marginTop: 'auto', width: '100%' }}
                                onClick={handleDownloadTemplate}
                                disabled={isDownloadingTemplate || isImporting}
                            >
                                {isDownloadingTemplate ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : (
                                    <Download size={15} />
                                )}
                                <span>
                                    {isDownloadingTemplate ? 'Đang tạo file mẫu...' : 'Tải file Excel mẫu (.xlsx)'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Bước 3: Upload file Excel */}
                    <div className="import-upload-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="import-step-badge">Bước 3</span>
                                <h4 className="import-step-title" style={{ margin: 0 }}>
                                    Chọn tệp Excel (.xlsx) đã điền để nhập dữ liệu
                                </h4>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Tối đa 20 MB</span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            disabled={isImporting}
                        />

                        {!selectedFile ? (
                            <div
                                className={`media-dropzone ${isImporting ? 'disabled' : ''}`}
                                style={{ padding: '1.25rem' }}
                                onClick={() => !isImporting && fileInputRef.current?.click()}
                            >
                                <div className="media-dropzone-empty" style={{ padding: '0.35rem 0' }}>
                                    <UploadCloud className="media-dropzone-icon" size={30} />
                                    <span className="media-dropzone-title">
                                        Bấm để chọn tệp Excel (.xlsx) từ máy tính
                                    </span>
                                    <span className="media-dropzone-hint">
                                        Hệ thống tự bỏ qua các dòng ví dụ có tiền tố [VÍ DỤ] và đối soát dữ liệu trước khi lưu.
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="import-selected-file">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                                    <FileSpreadsheet size={22} style={{ color: '#16a34a', flexShrink: 0 }} />
                                    <div style={{ minWidth: 0 }}>
                                        <div className="media-lib-filename" title={selectedFile.name}>
                                            {selectedFile.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {formatFileSize(selectedFile.size)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isImporting}
                                    >
                                        Đổi file
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-icon danger"
                                        onClick={() => {
                                            handleFileSelect(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        disabled={isImporting}
                                        title="Gỡ tệp đã chọn"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {fileError && (
                            <div className="media-error-alert">
                                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                <span>{fileError}</span>
                            </div>
                        )}
                    </div>

                    {/* Bảng báo cáo lỗi nếu file Excel không hợp lệ */}
                    {importResult && !importResult.imported && (
                        <ImportErrorTable
                            errors={importResult.errors}
                            isDownloadingReport={isDownloadingReport}
                            onDownloadReport={handleDownloadErrorReport}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="import-modal-footer">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleClose}
                        disabled={isImporting}
                    >
                        Đóng
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleImport}
                        disabled={!selectedFile || isImporting}
                    >
                        {isImporting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Đang kiểm tra & import...</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={16} />
                                <span>Tiến hành Import</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
