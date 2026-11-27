import React, { useEffect, useRef, useState } from 'react';
import {
    AlertCircle,
    Check,
    ChevronLeft,
    ChevronRight,
    Copy,
    Eye,
    EyeOff,
    History,
    Loader2,
    RefreshCw,
    UploadCloud,
    X,
} from 'lucide-react';
import { useMediaHistory, useMediaUpload, type SavedMedia } from '@/features/media';
import { useToast } from '@/core/ui';
import type { MediaKind } from '../../types';
import { MediaKindIcon } from './MediaKindIcon';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_FILES_PER_BATCH = 10;

const AUDIO_FORMATS = ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'];
const VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

function resolveKind(media: SavedMedia): MediaKind {
    if (media.kind === 'IMAGE' || media.kind === 'AUDIO' || media.kind === 'VIDEO') {
        return media.kind;
    }
    const fmt = media.format?.toLowerCase() || '';
    if (AUDIO_FORMATS.includes(fmt)) return 'AUDIO';
    if (VIDEO_FORMATS.includes(fmt)) return 'VIDEO';
    if (media.resourceType?.toLowerCase() === 'video') return 'VIDEO';
    return 'IMAGE';
}

function formatBytes(bytes?: number): string {
    if (!bytes || bytes <= 0) return '—';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDuration(seconds?: number): string {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function validateMediaBatch(files: File[]): string | null {
    if (files.length > MAX_FILES_PER_BATCH) {
        return `Mỗi lần chỉ được tải lên tối đa ${MAX_FILES_PER_BATCH} tệp media`;
    }
    for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isAudio = AUDIO_FORMATS.includes(ext) || file.type.startsWith('audio/');
        const isVideo = VIDEO_FORMATS.includes(ext) || file.type.startsWith('video/');
        const isImage = IMAGE_FORMATS.includes(ext) || file.type.startsWith('image/');

        if (isAudio) {
            if (file.size > MAX_AUDIO_SIZE) {
                return `Tệp âm thanh "${file.name}" vượt quá giới hạn 20 MB`;
            }
        } else if (isVideo) {
            if (file.size > MAX_VIDEO_SIZE) {
                return `Tệp video "${file.name}" vượt quá giới hạn 100 MB`;
            }
        } else if (isImage) {
            if (file.size > MAX_IMAGE_SIZE) {
                return `Hình ảnh "${file.name}" vượt quá giới hạn 5 MB`;
            }
        } else {
            return `Tệp "${file.name}" không đúng định dạng hỗ trợ (JPG, PNG, WEBP, MP3, WAV, M4A, MP4)`;
        }
    }
    return null;
}

/**
 * Popup quản lý Upload Media lên Cloudinary để lấy Media ID điền vào Excel.
 * Bao gồm 2 vùng: Upload tệp mới (hiển thị tên file + ID để copy) và Lịch sử đã upload phân trang 5 mục/trang kèm xem trước.
 */
export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ isOpen, onClose }) => {
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { upload, isUploading } = useMediaUpload();
    const {
        items: historyItems,
        page,
        totalPages,
        totalItems,
        isLoading: isLoadingHistory,
        errorMessage: historyError,
        setPage,
        refetch: refetchHistory,
    } = useMediaHistory(isOpen, 5);

    const [uploadError, setUploadError] = useState<string | null>(null);
    const [recentUploadedIds, setRecentUploadedIds] = useState<number[]>([]);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [previewMediaId, setPreviewMediaId] = useState<number | null>(null);
    const [lightboxMedia, setLightboxMedia] = useState<SavedMedia | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setUploadError(null);
            setRecentUploadedIds([]);
            setPreviewMediaId(null);
            setLightboxMedia(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopyId = async (id: number) => {
        try {
            await navigator.clipboard.writeText(String(id));
            setCopiedId(id);
            toast.success(`Đã sao chép Media ID: ${id}`);
            setTimeout(() => {
                setCopiedId((prev) => (prev === id ? null : prev));
            }, 2000);
        } catch {
            toast.error('Trình duyệt không cho phép sao chép tự động, vui lòng copy thủ công');
        }
    };

    const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const files = Array.from(fileList);
        setUploadError(null);

        const validationErr = validateMediaBatch(files);
        if (validationErr) {
            setUploadError(validationErr);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            const saved = await upload(files);
            setRecentUploadedIds((prev) => [...saved.map((m) => m.id), ...prev]);
            toast.success(`Đã tải lên thành công ${saved.length} tệp media`);
            if (page !== 0) {
                setPage(0);
            } else {
                await refetchHistory();
            }
        } catch (err) {
            setUploadError(
                err instanceof Error ? err.message : 'Tải tệp media lên Cloudinary thất bại'
            );
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const renderPreviewBlock = (media: SavedMedia) => {
        const kind = resolveKind(media);
        const displayName = media.originalFilename || media.publicId;

        if (kind === 'AUDIO') {
            return (
                <div className="media-lib-preview-box">
                    <audio controls src={media.url} style={{ width: '100%', height: '38px' }}>
                        Trình duyệt không hỗ trợ phát audio.
                    </audio>
                </div>
            );
        }

        if (kind === 'VIDEO') {
            return (
                <div className="media-lib-preview-box">
                    <video
                        controls
                        src={media.url}
                        style={{ width: '100%', maxHeight: '220px', borderRadius: '0.5rem', backgroundColor: '#000' }}
                    >
                        Trình duyệt không hỗ trợ phát video.
                    </video>
                </div>
            );
        }

        return (
            <div className="media-lib-preview-box">
                <img
                    src={media.url}
                    alt={displayName}
                    className="media-lib-preview-img"
                    onClick={() => setLightboxMedia(media)}
                    title="Bấm để phóng to ảnh"
                />
            </div>
        );
    };

    const renderMediaRow = (media: SavedMedia, isRecent: boolean) => {
        const kind = resolveKind(media);
        const displayName = media.originalFilename || media.publicId;
        const isPreviewOpen = previewMediaId === media.id;
        const isCopied = copiedId === media.id;
        const durationText = formatDuration(media.duration);

        return (
            <div
                key={`history-${media.id}`}
                className={`media-lib-item ${isRecent ? 'is-recent' : ''}`}
            >
                <div className="media-lib-item-main">
                    <div className="media-lib-item-info">
                        <MediaKindIcon kind={kind} size={18} />
                        <div className="media-lib-item-text">
                            <div className="media-lib-filename" title={displayName}>
                                {displayName}
                            </div>
                            <div className="media-lib-meta">
                                {isRecent && (
                                    <span className="media-recent-pill">Vừa tải lên</span>
                                )}
                                <span className="media-preview-badge">{media.format || kind}</span>
                                <span>{formatBytes(media.bytes)}</span>
                                {durationText && <span>· {durationText}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="media-lib-item-actions">
                        <span className="media-id-chip" title="Sao chép mã này vào cột Media trong Excel">
                            ID: <strong>{media.id}</strong>
                        </span>

                        <button
                            type="button"
                            className={`media-action-btn ${isCopied ? 'copied-btn' : 'replace-btn'}`}
                            onClick={() => handleCopyId(media.id)}
                            title="Sao chép Media ID"
                        >
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            <span>{isCopied ? 'Đã copy' : 'Copy ID'}</span>
                        </button>

                        <button
                            type="button"
                            className="media-action-btn replace-btn"
                            onClick={() => setPreviewMediaId(isPreviewOpen ? null : media.id)}
                            title={isPreviewOpen ? 'Ẩn xem trước' : 'Xem trước nội dung'}
                        >
                            {isPreviewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
                            <span>{isPreviewOpen ? 'Ẩn' : 'Xem trước'}</span>
                        </button>
                    </div>
                </div>

                {isPreviewOpen && renderPreviewBlock(media)}
            </div>
        );
    };

    return (
        <>
            <div className="modal-overlay" style={{ zIndex: 70 }} onClick={onClose}>
                <div
                    className="modal-content large media-lib-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header" style={{ marginBottom: '1rem' }}>
                        <div>
                            <h3 className="modal-title">Upload & Quản lý Media (Cloudinary)</h3>
                        </div>
                        <button
                            type="button"
                            className="modal-close"
                            onClick={onClose}
                            disabled={isUploading}
                            title="Đóng"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="media-lib-body">
                        {/* VÙNG 1: Upload media mới */}
                        <div className="media-lib-section">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                style={{ display: 'none' }}
                                accept="image/*,audio/*,video/*,.mp3,.wav,.m4a,.ogg,.mp4,.webm,.png,.jpg,.jpeg,.webp"
                                onChange={handleFilesSelected}
                                disabled={isUploading}
                            />

                            <div
                                className={`media-dropzone ${isUploading ? 'disabled' : ''}`}
                                style={{ padding: '1rem' }}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div className="media-dropzone-loading" style={{ padding: '0.5rem 0' }}>
                                        <Loader2 className="animate-spin" size={26} color="#ea580c" />
                                        <span className="media-dropzone-loading-text">
                                            Đang tải tệp tin lên Cloudinary và cấp Media ID...
                                        </span>
                                    </div>
                                ) : (
                                    <div className="media-dropzone-empty" style={{ padding: '0.35rem 0' }}>
                                        <UploadCloud className="media-dropzone-icon" size={28} />
                                        <span className="media-dropzone-title">
                                            Bấm để chọn ảnh / audio / video cần tải lên (tối đa 10 tệp/lần)
                                        </span>
                                        <span className="media-dropzone-hint">
                                            Hỗ trợ JPG, PNG, WEBP (≤ 5MB), MP3/WAV/M4A (≤ 20MB), MP4 (≤ 100MB).
                                        </span>
                                    </div>
                                )}
                            </div>

                            {uploadError && (
                                <div className="media-error-alert">
                                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                    <span>{uploadError}</span>
                                </div>
                            )}
                        </div>

                        {/* VÙNG 2: Lịch sử media đã tải lên (phân trang 5 mục/lần) */}
                        <div className="media-lib-section">
                            <div className="media-lib-history-header">
                                <div className="media-lib-subheading" style={{ margin: 0 }}>
                                    <History size={15} />
                                    <span>Lịch sử tệp đã tải lên ({totalItems})</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ padding: '0.3rem 0.625rem', fontSize: '0.75rem' }}
                                    onClick={() => refetchHistory()}
                                    disabled={isLoadingHistory}
                                >
                                    <RefreshCw size={13} className={isLoadingHistory ? 'animate-spin' : ''} />
                                    <span>Làm mới</span>
                                </button>
                            </div>

                            {historyError && (
                                <div className="media-error-alert" style={{ justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={16} />
                                        <span>{historyError}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                        onClick={() => refetchHistory()}
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            )}

                            {isLoadingHistory ? (
                                <div className="media-lib-empty">
                                    <Loader2 size={24} className="animate-spin" color="#ea580c" />
                                    <span>Đang tải lịch sử media...</span>
                                </div>
                            ) : historyItems.length === 0 ? (
                                <div className="media-lib-empty">
                                    <span>Chưa có tệp media nào được tải lên hệ thống.</span>
                                </div>
                            ) : (
                                <div className="media-lib-list">
                                    {historyItems.map((item) =>
                                        renderMediaRow(item, recentUploadedIds.includes(item.id))
                                    )}
                                </div>
                            )}

                            {totalItems > 0 && (
                                <div className="question-pagination-bar" style={{ padding: '0.5rem 0 0 0' }}>
                                    <div className="pagination-counter" style={{ fontSize: '0.75rem' }}>
                                        Trang <strong>{page + 1}</strong> / <strong>{totalPages}</strong> 
                                    </div>
                                    <div className="pagination-btn-group">
                                        <button
                                            type="button"
                                            className="pagination-nav-btn"
                                            style={{ minWidth: '2rem', height: '2rem' }}
                                            disabled={page <= 0 || isLoadingHistory}
                                            onClick={() => setPage(page - 1)}
                                            title="Trang trước"
                                        >
                                            <ChevronLeft size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            className="pagination-nav-btn"
                                            style={{ minWidth: '2rem', height: '2rem' }}
                                            disabled={page + 1 >= totalPages || isLoadingHistory}
                                            onClick={() => setPage(page + 1)}
                                            title="Trang sau"
                                        >
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {lightboxMedia && (
                <div
                    className="lightbox-overlay"
                    style={{ zIndex: 85 }}
                    onClick={() => setLightboxMedia(null)}
                >
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="lightbox-close-btn"
                            onClick={() => setLightboxMedia(null)}
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={lightboxMedia.url}
                            alt={lightboxMedia.originalFilename || lightboxMedia.publicId}
                            className="lightbox-image"
                        />
                        <div className="lightbox-caption">
                            ID: {lightboxMedia.id} — {lightboxMedia.originalFilename || lightboxMedia.publicId}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
