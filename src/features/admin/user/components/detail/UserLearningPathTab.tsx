import React from 'react';
import { BookOpen, Check, Compass, Lock } from 'lucide-react';
import type { AdminUserLearningPathItem, AdminUserLearningPathResponse } from '../../types';

interface UserLearningPathTabProps {
  // Dữ liệu lộ trình học hiện tại của học viên (null nếu chưa sinh lộ trình)
  learningPath: AdminUserLearningPathResponse | null;
}

// Chuyển đổi mã trạng thái lộ trình sang nhãn tiếng Việt gọn nhẹ
function formatPathStatus(status: string): string {
  // Đối chiếu giá trị Enum ELearningPathStatus bên Backend
  if (status === 'ACTIVE') return 'Đang học';
  if (status === 'COMPLETED') return 'Đã hoàn thành';
  if (status === 'ARCHIVED') return 'Đã lưu trữ';
  // Trả nguyên gốc nếu phát sinh giá trị khác
  return status;
}

// Render icon tròn trên trục dọc timeline tương đồng màn hình Lộ trình của Student
function renderTimelineNode(item: AdminUserLearningPathItem) {
  // Chặng đã hoàn thành hiển thị dấu tích xanh
  if (item.status === 'COMPLETED') {
    return (
      <div className="user-rm-node is-completed" title="Hoàn thành">
        <Check size={14} strokeWidth={3} />
      </div>
    );
  }
  // Chặng đang học hoặc đã mở khóa hiển thị chấm cam nổi bật
  if (item.status === 'IN_PROGRESS' || item.status === 'UNLOCKED') {
    return (
      <div className="user-rm-node is-active" title={item.statusLabel}>
        <div className="user-rm-node__dot" />
      </div>
    );
  }
  // Chặng còn lại ở trạng thái khóa hiển thị ổ khóa xám
  return (
    <div className="user-rm-node is-locked" title="Đang khóa">
      <Lock size={13} />
    </div>
  );
}

/**
 * Tab hiển thị tiến độ Lộ trình học tập hiện tại của học viên theo bố cục tương đồng trang Student.
 */
export const UserLearningPathTab: React.FC<UserLearningPathTabProps> = ({ learningPath }) => {
  // Trường hợp học viên chưa chọn AIM hoặc chưa làm bài chẩn đoán để sinh lộ trình
  if (!learningPath) {
    return (
      <div className="user-detail-empty">
        <Compass size={32} color="#94a3b8" />
        <p>Học viên chưa có lộ trình học tập nào</p>
      </div>
    );
  }

  // Render phần tổng quan tiến độ + dòng thời gian các chặng mô-đun
  return (
    <div className="user-rm-wrapper">
      <div className="user-rm-summary">
        <div className="user-rm-summary__left">
          <div className="user-rm-summary__title-row">
            <h2 className="user-rm-summary__title">
              Lộ trình học tập {learningPath.version ? `• Phiên bản #${learningPath.version}` : ''}
            </h2>
            <span className="user-rm-summary__status">{formatPathStatus(learningPath.status)}</span>
          </div>
          <p className="user-rm-summary__meta">
            {learningPath.targetScore ? `Mục tiêu AIM ${learningPath.targetScore} • ` : ''}
            {learningPath.completedModules}/{learningPath.totalModules} mô-đun hoàn thành
          </p>
        </div>

        <div className="user-rm-summary__progress">
          <div className="user-rm-summary__progress-text">
            <span>Tiến độ tổng thể</span>
            <strong>{learningPath.progressPercent}%</strong>
          </div>
          <div className="user-rm-progress-track">
            <div
              className="user-rm-progress-fill"
              style={{ width: `${learningPath.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {learningPath.items.length === 0 ? (
        <div className="user-detail-empty">
          <p>Lộ trình đã hoàn thành ở mức miễn học toàn bộ mô-đun</p>
        </div>
      ) : (
        <div className="user-rm-timeline">
          {learningPath.items.map((item, index) => {
            // Đánh dấu phần tử cuối cùng để không vẽ đoạn nối xuống dưới
            const isLast = index === learningPath.items.length - 1;
            // Xác định chặng đang mở để làm nổi nhẹ viền thẻ
            const isActive = item.status === 'IN_PROGRESS' || item.status === 'UNLOCKED';
            // Xác định chặng đã hoàn thành
            const isCompleted = item.status === 'COMPLETED';
            // Định dạng phần kỹ năng Listening / Reading gọn nhẹ
            const sectionLabel =
              item.section === 'LISTENING'
                ? 'Nghe hiểu'
                : item.section === 'READING'
                  ? 'Đọc hiểu'
                  : null;

            // Render một hàng gồm cột trục timeline bên trái và thẻ mô-đun bên phải
            return (
              <div key={item.id} className="user-rm-row">
                <div className="user-rm-spine">
                  {renderTimelineNode(item)}
                  {!isLast && <div className={`user-rm-line ${isCompleted ? 'is-completed' : ''}`} />}
                </div>

                <div className={`user-rm-card ${isActive ? 'is-active' : ''}`}>
                  <div className="user-rm-card__top">
                    <div className="user-rm-card__meta">
                      <span className="user-rm-card__order">Chặng #{item.orderNo}</span>
                      {item.partName && (
                        <span>
                          • {item.partName}
                          {sectionLabel ? ` (${sectionLabel})` : ''}
                        </span>
                      )}
                      {item.abilityName && <span>• {item.abilityName}</span>}
                    </div>

                    <span
                      className={`user-rm-card__status ${
                        isCompleted ? 'is-completed' : isActive ? 'is-active' : 'is-locked'
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                  </div>

                  <h3 className="user-rm-card__title">{item.moduleTitle}</h3>

                  {item.reason && <p className="user-rm-card__reason">{item.reason}</p>}

                  <div className="user-rm-card__footer">
                    <div className="user-rm-card__lessons">
                      <BookOpen size={14} />
                      <span>
                        {item.completedLessons}/{item.totalLessons} bài học
                      </span>
                    </div>

                    <div className="user-rm-card__bar-wrap">
                      <div className="user-rm-progress-track is-small">
                        <div
                          className="user-rm-progress-fill"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                      <span className="user-rm-card__pct">{item.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
