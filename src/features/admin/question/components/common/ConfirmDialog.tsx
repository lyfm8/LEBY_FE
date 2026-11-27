import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    warningNote?: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    warningNote,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    isDestructive = false,
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal-content"
                style={{ maxWidth: '440px', padding: 0, overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        {isDestructive ? (
                            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={16} />
                            </div>
                        ) : (
                            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={16} />
                            </div>
                        )}
                        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>{title}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="modal-close"
                        style={{ border: 'none', background: 'none' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.5 }}>
                        {message}
                    </p>

                    {warningNote && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', borderRadius: '0.375rem', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', border: '1px solid #fee2e2' }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                            <span>{warningNote}</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.625rem', padding: '0.875rem 1.25rem', backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
                    <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem' }}
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        style={{
                            padding: '0.4rem 1rem',
                            fontSize: '0.8125rem',
                            backgroundColor: isDestructive ? '#dc2626' : '#ea580c',
                            borderColor: isDestructive ? '#dc2626' : '#ea580c',
                        }}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
