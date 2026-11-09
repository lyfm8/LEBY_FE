import React, { useRef, useState } from 'react';
import { AlertCircle, Loader2, UploadCloud } from 'lucide-react';
import { useMediaUpload } from '@/features/media';
import type { MediaKind, QuestionMediaItem } from '../../types';
import { MediaPreview } from './MediaPreview';

interface MediaUploaderProps {
    medias: QuestionMediaItem[];
    onChange: (medias: QuestionMediaItem[]) => void;
    maxFiles?: number;
    allowedKinds?: MediaKind[];
    label?: string;
    hint?: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

const AUDIO_FORMATS = ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'];
const VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];

export const MediaUploader: React.FC<MediaUploaderProps> = ({
    medias,
    onChange,
    maxFiles = 3,
    allowedKinds = ['IMAGE', 'AUDIO', 'VIDEO'],
    label = 'Tệp đa phương tiện (Ảnh / Audio / Video)',
    hint = 'Kéo thả hoặc chọn tệp tin từ máy tính. Hệ thống sẽ tự nhận diện loại tệp.',
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceIndexRef = useRef<number | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const { uploadSingle, isUploading } = useMediaUpload();

    const resolveMediaKind = (format?: string, resourceType?: string): MediaKind => {
        const fmt = format?.toLowerCase() || '';
        if (AUDIO_FORMATS.includes(fmt)) return 'AUDIO';
        if (VIDEO_FORMATS.includes(fmt)) return 'VIDEO';
        if (resourceType === 'video') return 'VIDEO';
        return 'IMAGE';
    };

    const validateFile = (file: File): string | null => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isAudio = AUDIO_FORMATS.includes(ext) || file.type.startsWith('audio');
        const isVideo = VIDEO_FORMATS.includes(ext) || file.type.startsWith('video');
        const isImage = file.type.startsWith('image');

        if (isAudio) {
            if (!allowedKinds.includes('AUDIO')) {
                return 'Phần thi này không cho phép đính kèm tệp âm thanh (Audio)';
            }
            if (file.size > MAX_AUDIO_SIZE) {
                return 'Dung lượng tệp âm thanh không được vượt quá 20 MB';
            }
        } else if (isVideo) {
            if (!allowedKinds.includes('VIDEO')) {
                return 'Loại câu hỏi này không hỗ trợ đính kèm Video';
            }
            if (file.size > MAX_VIDEO_SIZE) {
                return 'Dung lượng video không được vượt quá 100 MB';
            }
        } else if (isImage) {
            if (!allowedKinds.includes('IMAGE')) {
                return 'Loại câu hỏi này không hỗ trợ đính kèm hình ảnh';
            }
            if (file.size > MAX_IMAGE_SIZE) {
                return 'Dung lượng hình ảnh không được vượt quá 5 MB';
            }
        } else {
            return 'Định dạng tệp tin không được hỗ trợ (chỉ nhận JPG, PNG, WEBP, MP3, WAV, MP4)';
        }
        return null;
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setValidationError(null);
        const error = validateFile(file);
        if (error) {
            setValidationError(error);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            const savedMedia = await uploadSingle(file);
            const kind = resolveMediaKind(savedMedia.format, savedMedia.resourceType);

            const newItem: QuestionMediaItem = {
                mediaId: savedMedia.id,
                publicId: savedMedia.publicId,
                url: savedMedia.url,
                kind,
                format: savedMedia.format,
                bytes: savedMedia.bytes,
                originalFilename: savedMedia.originalFilename || file.name,
                duration: savedMedia.duration,
                width: savedMedia.width,
                height: savedMedia.height,
                orderNo: medias.length + 1,
            };

            if (replaceIndexRef.current !== null && replaceIndexRef.current >= 0) {
                const nextMedias = [...medias];
                nextMedias[replaceIndexRef.current] = {
                    ...newItem,
                    orderNo: replaceIndexRef.current + 1,
                };
                onChange(nextMedias);
                replaceIndexRef.current = null;
            } else {
                onChange([...medias, newItem]);
            }
        } catch (uploadErr) {
            setValidationError(
                uploadErr instanceof Error
                    ? uploadErr.message
                    : 'Tải tệp tin lên máy chủ thất bại, vui lòng thử lại'
            );
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveMedia = (index: number) => {
        const nextMedias = medias
            .filter((_, idx) => idx !== index)
            .map((item, idx) => ({ ...item, orderNo: idx + 1 }));
        onChange(nextMedias);
    };

    const handleReplaceMedia = (index: number) => {
        replaceIndexRef.current = index;
        fileInputRef.current?.click();
    };

    const canAddMore = medias.length < maxFiles;

    return (
        <div className="media-uploader-component">
            <div className="media-uploader-top">
                <label className="form-label font-medium text-gray-700">{label}</label>
                <span className="media-counter">
                    {medias.length}/{maxFiles} tệp
                </span>
            </div>

            {/* Input file ẩn */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelected}
                disabled={isUploading}
            />

            {/* Vùng Dropzone nếu còn chỗ trống */}
            {canAddMore && (
                <div
                    className={`media-dropzone ${isUploading ? 'disabled' : ''}`}
                    onClick={() => {
                        if (!isUploading) {
                            replaceIndexRef.current = null;
                            fileInputRef.current?.click();
                        }
                    }}
                >
                    {isUploading ? (
                        <div className="media-dropzone-loading">
                            <Loader2 className="animate-spin" size={28} color="#ea580c" />
                            <span className="media-dropzone-loading-text">
                                Đang tải tệp tin lên Cloudinary và lưu dữ liệu...
                            </span>
                        </div>
                    ) : (
                        <div className="media-dropzone-empty">
                            <UploadCloud className="media-dropzone-icon" size={32} />
                            <span className="media-dropzone-title">
                                Bấm để tải lên hoặc kéo thả tệp vào đây
                            </span>
                            <span className="media-dropzone-hint">
                                {hint}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Cảnh báo lỗi validation */}
            {validationError && (
                <div className="media-error-alert">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{validationError}</span>
                </div>
            )}

            {/* Danh sách media đã upload - hiển thị nội dung bên dưới có thể play được */}
            {medias.length > 0 && (
                <div className="media-preview-list">
                    {medias.map((media, idx) => (
                        <MediaPreview
                            key={`${media.mediaId}-${idx}`}
                            media={media}
                            onRemove={() => handleRemoveMedia(idx)}
                            onReplace={() => handleReplaceMedia(idx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

