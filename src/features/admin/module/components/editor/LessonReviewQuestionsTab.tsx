import React from 'react';
import { HelpCircle, Clock, Sparkles } from 'lucide-react';

/**
 * Tab 3: Câu hỏi ôn tập (Giao diện Placeholder tinh gọn theo yêu cầu giai đoạn hiện tại).
 */
export const LessonReviewQuestionsTab: React.FC = () => {
  return (
    <div className="tab-content-wrapper">
      <div className="tab-card questions-placeholder-card">
        <div className="placeholder-icon-circle">
          <HelpCircle size={40} className="text-orange" />
        </div>

        <h3 className="placeholder-title">Câu hỏi ôn tập (Lesson Review Questions)</h3>

        <p className="placeholder-description">
          Tính năng quản lý và liên kết câu hỏi ôn tập theo bài học đang được phát triển ở giai đoạn tiếp theo.
        </p>

        <div className="placeholder-features-preview">
          <div className="feature-item">
            <Sparkles size={16} className="text-orange" />
            <span>Tạo câu hỏi trắc nghiệm, điền từ trực tiếp từ bài học</span>
          </div>
          <div className="feature-item">
            <Sparkles size={16} className="text-orange" />
            <span>Tự động đồng bộ câu hỏi vào Ngân hàng câu hỏi (Question Bank)</span>
          </div>
          <div className="feature-item">
            <Sparkles size={16} className="text-orange" />
            <span>Hỗ trợ đính kèm Audio, Video, Ảnh độc lập cho từng câu hỏi</span>
          </div>
        </div>

        <div className="placeholder-status-pill">
          <Clock size={13} />
          <span>Sắp ra mắt ở phiên bản tiếp theo</span>
        </div>
      </div>
    </div>
  );
};

