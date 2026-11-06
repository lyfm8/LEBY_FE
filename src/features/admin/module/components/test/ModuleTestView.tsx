import React from 'react';
import { Award, FileCheck2, Info, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleTestViewProps {
  moduleId: number;
  moduleTitle: string;
  passScore: number;
  requiredCompletionRate: number;
  onBack: () => void;
  onOpenThresholds?: () => void;
}

export const ModuleTestView: React.FC<ModuleTestViewProps> = ({
  moduleId,
  moduleTitle,
  passScore,
  requiredCompletionRate,
  onBack,
  onOpenThresholds,
}) => {
  const navigate = useNavigate();

  return (
    <div className="editor-pane-container">
      {/* Header */}
      <div className="editor-pane-header">
        <div className="editor-header-left">
          <div className="badge-type-pill text-orange">
            <Award size={15} />
            <span>Bài Thi Vượt Ải Module</span>
          </div>
          <h1 className="editor-main-title">
            Module Test: {moduleTitle}
          </h1>
          <p className="editor-subtitle">
            Bài kiểm tra đánh giá năng lực cuối mô-đun để xác định học viên đủ điều kiện tiến sang nội dung tiếp theo.
          </p>
        </div>

        <div className="editor-header-right">
          <button
            type="button"
            className="btn-secondary"
            onClick={onBack}
          >
            <ArrowLeft size={15} />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="editor-pane-body">
        <div className="editor-form-grid">
          {/* Card 1: Tiêu chuẩn đỗ & điều kiện mở bài thi */}
          <div className="editor-card">
            <div className="card-header-row">
              <FileCheck2 size={16} className="text-orange" />
              <h3 className="card-section-title">Tiêu chuẩn vượt ải</h3>
            </div>

            <div className="test-stat-tiles-grid">
              <div className="test-stat-tile">
                <span className="tile-label">Điểm đỗ yêu cầu</span>
                <span className="tile-value text-orange">
                  {passScore}/100đ
                </span>
                <span className="tile-hint">Học viên cần đạt tối thiểu để Pass</span>
              </div>

              <div className="test-stat-tile">
                <span className="tile-label">Điều kiện mở đề thi</span>
                <span className="tile-value text-blue">
                  {requiredCompletionRate}%
                </span>
                <span className="tile-hint">Số bài học phải hoàn thành trước đó</span>
              </div>
            </div>

            {onOpenThresholds && (
              <div className="info-callout-box mt-4">
                <Info size={15} />
                <span>
                  Các tham số này có thể điều chỉnh linh hoạt ở mục{' '}
                  <button
                    type="button"
                    className="btn-inline-link"
                    onClick={onOpenThresholds}
                  >
                    Cấu hình thông số
                  </button>
                  .
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Ngân hàng câu hỏi bài thi */}
          <div className="editor-card">
            <div className="card-header-row">
              <Award size={16} className="text-orange" />
              <h3 className="card-section-title">Cấu hình câu hỏi bài thi</h3>
            </div>

            <p className="text-muted text-sm mb-4">
              Các câu hỏi trong bài thi vượt ải được liên kết từ Ngân hàng câu hỏi theo Part và Năng lực phụ trách của Module ID #{moduleId}.
            </p>

            <div className="action-box-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Quản lý câu hỏi trong Ngân hàng đề</h4>
                  <p className="text-muted text-xs">
                    Thêm, sửa câu hỏi trắc nghiệm hoặc phân loại theo Part & Ability
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary compact"
                  onClick={() => navigate('/admin/questions')}
                >
                  <ExternalLink size={14} />
                  <span>Mở Ngân hàng câu hỏi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

