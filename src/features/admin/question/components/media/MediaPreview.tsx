import React, { useState } from 'react';
import { Eye, Trash2, UploadCloud, X } from 'lucide-react';
import type { QuestionMediaItem } from '../../types';
import { MediaKindIcon } from './MediaKindIcon';

interface MediaPreviewProps {
    media: QuestionMediaItem;
    onRemove?: () => void;
    onReplace?: () => void;
    readOnly?: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
    media,
    onRemove,
    onReplace,
    readOnly = false,
}) => {
    const [showImageLightbox, setShowImageLightbox] = useState<boolean>(false);

    const formatBytes = (bytes?: number): string => {
        if (!bytes || bytes <= 0) return '';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds || seconds <= 0) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const fileName =
        media.originalFilename ||
        media.url.split('/').pop()?.split('?')[0] ||
        'media-file';

    return (
        <div className="media-preview-card">
            {/* Header thông tin file */}
            <div className="media-preview-header">
                <div className="media-preview-meta">
                    <MediaKindIcon kind={media.kind} size={18} />
                    <span className="media-preview-filename" title={fileName}>
                        {fileName}
                    </span>
                    <span className="media-preview-badge">{media.format || media.kind}</span>
                    {media.bytes && media.bytes > 0 && (
                        <span className="media-preview-subtext">{formatBytes(media.bytes)}</span>
                    )}
                    {media.duration && media.duration > 0 && (
                        <span className="media-preview-subtext">· {formatDuration(media.duration)}</span>
                    )}
                </div>

                {!readOnly && (
                    <div className="media-preview-actions">
                        {onReplace && (
                            <button
                                type="button"
                                className="media-action-btn replace-btn"
                                onClick={onReplace}
                                title="Thay thế tệp tin"
                            >
                                <UploadCloud size={14} /> Thay tệp
                            </button>
                        )}
                        {onRemove && (
                            <button
                                type="button"
                                className="media-action-btn delete-btn"
                                onClick={onRemove}
                                title="Xóa tệp tin"
                            >
                                <Trash2 size={14} /> Xóa
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Trình phát media theo loại */}
            <div className="media-preview-content">
                {media.kind === 'AUDIO' && (
                    <div className="audio-player-wrapper">
                        <audio controls src={media.url}>
                            Trình duyệt của bạn không hỗ trợ phát audio.
                        </audio>
                    </div>
                )}

                {media.kind === 'VIDEO' && (
                    <div className="video-player-wrapper">
                        <video controls src={media.url}>
                            Trình duyệt của bạn không hỗ trợ phát video.
                        </video>
                    </div>
                )}

                {media.kind === 'IMAGE' && (
                    <div className="image-preview-wrapper">
                        <img
                            src={media.url}
                            alt={fileName}
                            className="image-thumbnail"
                            onClick={() => setShowImageLightbox(true)}
                        />
                        <button
                            type="button"
                            className="image-expand-btn"
                            onClick={() => setShowImageLightbox(true)}
                        >
                            <Eye size={14} /> Xem to
                        </button>
                    </div>
                )}
            </div>

            {/* Lightbox xem ảnh lớn */}
            {showImageLightbox && (
                <div className="lightbox-overlay" onClick={() => setShowImageLightbox(false)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="lightbox-close-btn"
                            onClick={() => setShowImageLightbox(false)}
                        >
                            <X size={20} />
                        </button>
                        <img src={media.url} alt={fileName} className="lightbox-image" />
                        <div className="lightbox-caption">{fileName}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

