import React, { useState, useEffect } from 'react';
import type { LessonScriptDto } from '../../types';
import { useMediaPlaybackSync } from '../../hooks/useMediaPlaybackSync';
import {
  Play,
  Pause,
  Volume2,
  Plus,
  Trash2,
  Edit2,
  Save,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';

interface LessonScriptTabProps {
  lessonId: number;
  audioUrl?: string | null;
  videoUrl?: string | null;
  initialScripts?: LessonScriptDto[];
  onSaveScripts: (scripts: LessonScriptDto[]) => Promise<void>;
  isSaving: boolean;
}

export const LessonScriptTab: React.FC<LessonScriptTabProps> = ({
  lessonId: _lessonId,
  audioUrl,
  videoUrl,
  initialScripts = [],
  onSaveScripts,
  isSaving,
}) => {
  const mediaSource = audioUrl || videoUrl;

  const {
    mediaRef,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekAndPlay,
    formatSecondsToTime,
    setCurrentTime,
    setDuration,
    setIsPlaying,
  } = useMediaPlaybackSync(mediaSource);

  const [scripts, setScripts] = useState<LessonScriptDto[]>(initialScripts);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form input tạm cho 1 câu script
  const [formStartTime, setFormStartTime] = useState<string>('00:00');
  const [formEndTime, setFormEndTime] = useState<string>('00:03');
  const [formSpeaker, setFormSpeaker] = useState<string>('');
  const [formContentEn, setFormContentEn] = useState<string>('');
  const [formContentVi, setFormContentVi] = useState<string>('');

  useEffect(() => {
    setScripts(initialScripts);
  }, [initialScripts]);

  // Mở modal thêm câu mới
  const handleAddNewScript = () => {
    setEditingIndex(null);
    const lastScript = scripts[scripts.length - 1];
    const nextStart = lastScript ? lastScript.endTime : '00:00';
    setFormStartTime(nextStart);
    setFormEndTime(nextStart);
    setFormSpeaker('');
    setFormContentEn('');
    setFormContentVi('');
    setIsEditingModalOpen(true);
  };

  // Mở modal sửa câu hiện có
  const handleEditScript = (index: number) => {
    setEditingIndex(index);
    const item = scripts[index];
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormSpeaker(item.speaker || '');
    setFormContentEn(item.contentEn);
    setFormContentVi(item.contentVi || '');
    setIsEditingModalOpen(true);
  };

  // Lưu câu thoại vào danh sách local
  const handleSaveItem = () => {
    if (!formContentEn.trim()) {
      alert('Vui lòng nhập nội dung câu thoại tiếng Anh');
      return;
    }

    const newItem: LessonScriptDto = {
      orderNo: editingIndex !== null ? scripts[editingIndex].orderNo : scripts.length + 1,
      startTime: formStartTime.trim() || '00:00',
      endTime: formEndTime.trim() || '00:03',
      speaker: formSpeaker.trim() || undefined,
      contentEn: formContentEn.trim(),
      contentVi: formContentVi.trim() || undefined,
    };

    if (editingIndex !== null) {
      const updated = [...scripts];
      updated[editingIndex] = newItem;
      setScripts(updated);
    } else {
      setScripts([...scripts, newItem]);
    }

    setIsEditingModalOpen(false);
  };

  // Xóa câu thoại
  const handleDeleteItem = (index: number) => {
    const updated = scripts.filter((_, idx) => idx !== index);
    // Cập nhật lại orderNo
    const reordered = updated.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    setScripts(reordered);
  };

  // Di chuyển thứ tự
  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === scripts.length - 1) return;

    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const updated = [...scripts];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    setScripts(reordered);
  };

  return (
    <div className="tab-content-wrapper">
      {/* 1. Trình phát Media kết nối với File ở Tab 1 */}
      <div className="script-media-player-card">
        <div className="player-meta-row">
          <div className="media-info">
            <Volume2 size={18} className="text-orange" />
            <span className="media-title font-medium">
              {mediaSource ? 'Media liên kết của bài học' : 'Chưa có file Audio/Video ở Tab Nội dung'}
            </span>
          </div>

          <div className="player-time-display font-mono">
            {formatSecondsToTime(currentTime)} / {formatSecondsToTime(duration)}
          </div>
        </div>

        {mediaSource ? (
          <div className="player-controls-row">
            <button
              type="button"
              className="player-play-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                if (mediaRef.current) {
                  const val = Number(e.target.value);
                  mediaRef.current.currentTime = val;
                  setCurrentTime(val);
                }
              }}
              className="player-timeline-slider"
            />

            {/* Hidden audio element để điều khiển */}
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={mediaSource}
              onTimeUpdate={() => {
                if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (mediaRef.current) setDuration(mediaRef.current.duration);
              }}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <div className="player-warning-banner">
            <Info size={14} />
            <span>
              Vui lòng quay lại <strong>Tab 1: Nội dung bài giảng</strong> để chọn file âm thanh (Audio) hoặc Video.
            </span>
          </div>
        )}
      </div>

      {/* 2. Danh sách các bản ghi Script */}
      <div className="tab-card">
        <div className="card-header-row justify-between">
          <div>
            <h3 className="tab-card-title">Kịch bản lời thoại (Script)</h3>
            <span className="text-muted text-xs">
              💡 Bấm vào mốc thời gian để nghe phát thử câu thoại đó trên audio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary compact"
              onClick={handleAddNewScript}
            >
              <Plus size={14} />
              <span>Thêm câu mới</span>
            </button>

            <button
              type="button"
              className="btn-primary compact"
              onClick={() => onSaveScripts(scripts)}
              disabled={isSaving}
            >
              <Save size={14} />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu kịch bản'}</span>
            </button>
          </div>
        </div>

        {/* Danh sách các câu thoại */}
        <div className="scripts-list">
          {scripts.length > 0 ? (
            scripts.map((item, index) => (
              <div key={index} className="script-row-card">
                <div className="script-order-badge">
                  {String(item.orderNo).padStart(2, '0')}
                </div>

                {/* Nút bấm mốc thời gian -> seek và phát */}
                <button
                  type="button"
                  className="script-timestamp-btn"
                  onClick={() => seekAndPlay(item.startTime)}
                  title={`Phát đoạn ${item.startTime} - ${item.endTime}`}
                >
                  <Play size={12} className="play-icon" />
                  <span>
                    {item.startTime} - {item.endTime}
                  </span>
                </button>

                {/* Nội dung lời thoại */}
                <div className="script-content-wrapper">
                  <div className="script-en-line">
                    {item.speaker && (
                      <span className="speaker-tag">{item.speaker}:</span>
                    )}
                    <span className="en-text">{item.contentEn}</span>
                  </div>
                  {item.contentVi && (
                    <div className="script-vi-line">
                      <span className="vi-label">Dịch:</span>
                      <span className="vi-text">{item.contentVi}</span>
                    </div>
                  )}
                </div>

                {/* Thao tác */}
                <div className="script-actions-wrapper">
                  <button
                    type="button"
                    className="action-btn"
                    title="Di chuyển lên"
                    onClick={() => handleMove(index, 'UP')}
                    disabled={index === 0}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    title="Di chuyển xuống"
                    onClick={() => handleMove(index, 'DOWN')}
                    disabled={index === scripts.length - 1}
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    title="Chỉnh sửa câu"
                    onClick={() => handleEditScript(index)}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="action-btn delete"
                    title="Xóa câu"
                    onClick={() => handleDeleteItem(index)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="scripts-empty-state">
              <p>Chưa có bản ghi Script nào cho bài học này.</p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddNewScript}
              >
                <Plus size={14} /> Thêm bản ghi đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal chỉnh sửa / thêm mới câu thoại */}
      {isEditingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card-box">
            <h3 className="modal-title font-bold text-lg mb-4">
              {editingIndex !== null ? 'Chỉnh sửa câu thoại' : 'Thêm câu thoại mới'}
            </h3>

            <div className="form-row-2 mb-3">
              <div className="form-group">
                <label className="form-label text-xs">Thời điểm bắt đầu (mm:ss)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="00:00"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Thời điểm kết thúc (mm:ss)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="00:03"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label text-xs">Nhân vật / Người nói (Speaker)</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Anna, John, Speaker A..."
                value={formSpeaker}
                onChange={(e) => setFormSpeaker(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label text-xs">
                Lời thoại tiếng Anh <span className="text-red">*</span>
              </label>
              <textarea
                rows={3}
                className="form-input textarea"
                placeholder="Good morning. Welcome to our restaurant."
                value={formContentEn}
                onChange={(e) => setFormContentEn(e.target.value)}
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label text-xs">Bản dịch tiếng Việt (Không bắt buộc)</label>
              <textarea
                rows={2}
                className="form-input textarea"
                placeholder="Chào buổi sáng. Chào mừng bạn đến với nhà hàng của chúng tôi."
                value={formContentVi}
                onChange={(e) => setFormContentVi(e.target.value)}
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditingModalOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveItem}
              >
                Lưu vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
