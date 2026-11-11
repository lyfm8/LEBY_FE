import React, { useState, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { LessonFormValues } from '../../utils/schema';
import type { AbilityResponse } from '@/features/admin/part/types';
import {
  Upload,
  Video,
  Music,
  Image as ImageIcon,
  Trash2,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Quote,
  ClipboardList,
  Clock,
} from 'lucide-react';

interface LessonContentTabProps {
  form: UseFormReturn<LessonFormValues>;
  abilities: AbilityResponse[];
}

export const LessonContentTab: React.FC<LessonContentTabProps> = ({
  form,
  abilities,
}) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const audioUrl = watch('audioUrl');
  const videoUrl = watch('videoUrl');
  const imageUrl = watch('imageUrl');
  const lessonType = watch('lessonType');
  const durationSeconds = watch('durationSeconds') ?? 0;

  /**
   * Chuyển đổi durationSeconds thành chuỗi mm:ss để hiển thị trực quan.
   */
  const durationDisplay = `${String(Math.floor(durationSeconds / 60)).padStart(2, '0')}:${String(durationSeconds % 60).padStart(2, '0')}`;

  // Quản lý tên file hiển thị cục bộ khi chọn từ máy tính
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');

  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Xử lý chọn file Video từ máy
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFileName(file.name);
      const blobUrl = URL.createObjectURL(file);
      setValue('videoUrl', blobUrl, { shouldDirty: true });
    }
  };

  // Xử lý chọn file Audio từ máy
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      const blobUrl = URL.createObjectURL(file);
      setValue('audioUrl', blobUrl, { shouldDirty: true });
    }
  };

  // Xử lý chọn file Ảnh từ máy
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const blobUrl = URL.createObjectURL(file);
      setValue('imageUrl', blobUrl, { shouldDirty: true });
    }
  };

  // Xóa media
  const removeVideo = () => {
    setValue('videoUrl', '', { shouldDirty: true });
    setVideoFileName('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeAudio = () => {
    setValue('audioUrl', '', { shouldDirty: true });
    setAudioFileName('');
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const removeImage = () => {
    setValue('imageUrl', '', { shouldDirty: true });
    setImageFileName('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Rich text formatting helper
  const insertTextFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    const replacement = `${prefix}${selectedText || 'Văn bản'}${suffix}`;
    const nextVal =
      currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setValue('descriptions', nextVal, { shouldDirty: true });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 7)
      );
    }, 0);
  };

  return (
    <div className="tab-content-wrapper">
      {/* 1. Thông tin cơ bản bài học */}
      <div className="tab-card">
        <h3 className="tab-card-title">Cấu hình bài học</h3>

        <div className="form-group">
          <label className="form-label">
            Tên bài học <span className="text-red">*</span>
          </label>
          <input
            {...register('title')}
            type="text"
            className="form-input"
            placeholder="VD: At the Restaurant - Chi tiết gọi món & thanh toán"
          />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">
              Thứ tự bài học <span className="text-red">*</span>
            </label>
            <input
              {...register('orderNo', { valueAsNumber: true })}
              type="number"
              min="1"
              className="form-input"
            />
            {errors.orderNo && <p className="form-error">{errors.orderNo.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Năng lực rèn luyện (Ability)</label>
            <select
              {...register('abilityId', {
                setValueAs: (v) => (v === '' ? null : Number(v)),
              })}
              className="form-input"
            >
              <option value="">-- Không gán năng lực --</option>
              {abilities.map((ab) => (
                <option key={ab.id} value={ab.id}>
                  {ab.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Chế độ học viên</label>
            <div className="checkbox-toggle-wrapper">
              <label className="toggle-switch">
                <input type="checkbox" {...register('isFree')} />
                <span className="slider round" />
              </label>
              <span className="toggle-label">
                {watch('isFree') ? 'Bài học Miễn phí' : 'Yêu cầu Trả phí (Pro)'}
              </span>
            </div>
          </div>
        </div>

        {/* Loại bài học và Thời lượng */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">
              Loại bài học <span className="text-red">*</span>
            </label>
            <div className="radio-pill-group">
              <label className={`radio-pill ${lessonType === 'VIDEO' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  {...register('lessonType')}
                  value="VIDEO"
                />
                <Video size={14} />
                <span>Video bài giảng</span>
              </label>
              <label className={`radio-pill ${lessonType === 'PRACTICE' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  {...register('lessonType')}
                  value="PRACTICE"
                />
                <ClipboardList size={14} />
                <span>Bài thực hành</span>
              </label>
            </div>
            {errors.lessonType && <p className="form-error">{errors.lessonType.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Thời lượng bài học (giây)
              <span className="label-hint"> — Hiển thị: {durationDisplay}</span>
            </label>
            <div className="duration-input-wrapper">
              <Clock size={14} className="duration-icon" />
              <input
                {...register('durationSeconds', { valueAsNumber: true })}
                type="number"
                min="0"
                max="86400"
                className="form-input duration-input"
                placeholder="VD: 300 (= 05:00)"
              />
            </div>
            {errors.durationSeconds && <p className="form-error">{errors.durationSeconds.message}</p>}
          </div>
        </div>
      </div>

      {/* 2. Tài liệu Đa phương tiện (Upload từ máy tính) */}
      <div className="tab-card">
        <div className="card-header-with-hint">
          <h3 className="tab-card-title">Tài liệu Đa phương tiện (Upload từ máy)</h3>
          <span className="text-muted text-xs">
            * Chọn tệp trực tiếp từ máy để xem trước (Preview) ngay trên giao diện
          </span>
        </div>

        <div className="media-dropzones-grid">
          {/* Ô 1: Video bài giảng */}
          <div className={`media-dropzone-box ${videoUrl ? 'has-media' : ''}`}>
            <div className="dropzone-header">
              <div className="icon-tag text-blue">
                <Video size={16} />
                <span>Video bài giảng (.mp4, .webm)</span>
              </div>
              {videoUrl && (
                <button
                  type="button"
                  className="btn-remove-media"
                  onClick={removeVideo}
                  title="Xóa video"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {videoUrl ? (
              <div className="media-file-info">
                <p className="file-name" title={videoFileName || videoUrl}>
                  {videoFileName || 'Video đã được chọn'}
                </p>
                <div className="video-preview-wrapper">
                  <video src={videoUrl} controls className="preview-video-player" />
                </div>
              </div>
            ) : (
              <div
                className="dropzone-empty-area"
                onClick={() => videoInputRef.current?.click()}
              >
                <Upload size={22} className="dropzone-icon" />
                <p className="dropzone-text">Bấm để chọn Video từ máy tính</p>
                <span className="dropzone-subtext">Hỗ trợ MP4, WEBM tối đa 200MB</span>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Ô 2: File Âm thanh (Audio guide / Listening) */}
          <div className={`media-dropzone-box ${audioUrl ? 'has-media' : ''}`}>
            <div className="dropzone-header">
              <div className="icon-tag text-orange">
                <Music size={16} />
                <span>File Âm thanh (.mp3, .wav)</span>
              </div>
              {audioUrl && (
                <button
                  type="button"
                  className="btn-remove-media"
                  onClick={removeAudio}
                  title="Xóa audio"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {audioUrl ? (
              <div className="media-file-info">
                <p className="file-name" title={audioFileName || audioUrl}>
                  {audioFileName || 'Âm thanh đã được chọn'}
                </p>
                <div className="audio-preview-wrapper">
                  <audio src={audioUrl} controls className="preview-audio-player" />
                </div>
              </div>
            ) : (
              <div
                className="dropzone-empty-area"
                onClick={() => audioInputRef.current?.click()}
              >
                <Upload size={22} className="dropzone-icon" />
                <p className="dropzone-text">Bấm để chọn Audio từ máy tính</p>
                <span className="dropzone-subtext">Hỗ trợ MP3, WAV tối đa 50MB</span>
              </div>
            )}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mp3,audio/wav,audio/mpeg"
              onChange={handleAudioFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Ô 3: Hình ảnh minh họa */}
          <div className={`media-dropzone-box ${imageUrl ? 'has-media' : ''}`}>
            <div className="dropzone-header">
              <div className="icon-tag text-green">
                <ImageIcon size={16} />
                <span>Hình ảnh minh họa (.png, .jpg)</span>
              </div>
              {imageUrl && (
                <button
                  type="button"
                  className="btn-remove-media"
                  onClick={removeImage}
                  title="Xóa hình ảnh"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="media-file-info">
                <p className="file-name" title={imageFileName || imageUrl}>
                  {imageFileName || 'Hình ảnh đã chọn'}
                </p>
                <div className="image-preview-wrapper">
                  <img src={imageUrl} alt="Minh họa" className="preview-image" />
                </div>
              </div>
            ) : (
              <div
                className="dropzone-empty-area"
                onClick={() => imageInputRef.current?.click()}
              >
                <Upload size={22} className="dropzone-icon" />
                <p className="dropzone-text">Bấm để chọn Ảnh từ máy tính</p>
                <span className="dropzone-subtext">Hỗ trợ PNG, JPG, WEBP</span>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Soạn thảo Nội dung Văn bản (Rich Text Editor) */}
      <div className="tab-card">
        <h3 className="tab-card-title">Nội dung bài học văn bản (Lý thuyết & Từ vựng)</h3>

        <div className="rich-editor-toolbar">
          <button
            type="button"
            className="toolbar-btn"
            title="In đậm"
            onClick={() => insertTextFormatting('**', '**')}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="In nghiêng"
            onClick={() => insertTextFormatting('*', '*')}
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="Tiêu đề 1"
            onClick={() => insertTextFormatting('# ')}
          >
            <Heading1 size={14} />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="Tiêu đề 2"
            onClick={() => insertTextFormatting('## ')}
          >
            <Heading2 size={14} />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="Danh sách gạch đầu dòng"
            onClick={() => insertTextFormatting('- ')}
          >
            <List size={14} />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="Trích dẫn"
            onClick={() => insertTextFormatting('> ')}
          >
            <Quote size={14} />
          </button>
        </div>

        <textarea
          {...register('descriptions')}
          ref={(e) => {
            register('descriptions').ref(e);
            textareaRef.current = e;
          }}
          rows={10}
          className="rich-textarea"
          placeholder="Nhập nội dung giảng dạy, mẹo làm bài, danh sách từ vựng trọng tâm..."
        />
      </div>
    </div>
  );
};
