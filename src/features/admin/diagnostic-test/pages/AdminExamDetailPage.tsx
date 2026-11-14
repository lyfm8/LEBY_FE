import React from 'react';
import { ChevronLeft, Clock, HelpCircle, Headphones, BookOpen, CheckCircle2, Archive, ArrowLeft } from 'lucide-react';
import { useExamDetail } from '../hooks/useExamDetail';
import '../admin-exam.css';

/**
 * Màn hình 3: Xem chi tiết bộ đề thi và danh sách câu hỏi.
 * Presentational Component: Chỉ render UI, toàn bộ state & actions được quản lý bởi useExamDetail.
 */
export const AdminExamDetailPage: React.FC = () => {
  const {
    exam,
    loading,
    selectedPartFilter,
    setSelectedPartFilter,
    filteredQuestions,
    isAdmin,
    handleNavigateBack,
    handleActivate,
    handleArchive,
  } = useExamDetail();

  if (loading) {
    return (
      <div className="exam-page-container" style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
        Đang tải thông tin chi tiết đề thi...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="exam-page-container" style={{ textAlign: 'center', padding: '60px', color: '#DC2626' }}>
        Không tìm thấy đề thi yêu cầu.
        <div style={{ marginTop: '16px' }}>
          <button type="button" className="btn-outline-gray" onClick={handleNavigateBack}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-page-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={handleNavigateBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            fontSize: '13px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={16} />
          <span>Quản lý đề thi</span>
        </button>
      </div>

      {/* Main Info Card Header */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={exam.testType === 'FULL_MOCK_TEST' ? 'badge-mock' : 'badge-diagnostic'}>
              {exam.testType === 'FULL_MOCK_TEST' ? 'MOCK TEST' : 'DIAGNOSTIC TEST'}
            </span>

            <span className={`dot-status-badge ${exam.examStatus.toLowerCase()}`}>
              <span className="dot-indicator" />
              <span>{exam.examStatus === 'ACTIVE' ? 'Active' : exam.examStatus === 'ARCHIVE' ? 'Archive' : 'Draft'}</span>
            </span>
          </div>

          {/* Action buttons (Admin only for activate/archive) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {isAdmin && exam.examStatus !== 'ACTIVE' && (
              <button type="button" className="btn-primary-orange" onClick={handleActivate}>
                <CheckCircle2 size={16} />
                <span>Kích hoạt đề thi</span>
              </button>
            )}

            {isAdmin && exam.examStatus === 'ACTIVE' && (
              <button type="button" className="btn-outline-gray" onClick={handleArchive}>
                <Archive size={16} />
                <span>Lưu trữ đề thi</span>
              </button>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>{exam.title}</h1>
        <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          {exam.description || 'Không có mô tả bổ sung.'}
        </p>

        {/* 4 Stat Pills */}
        <div className="stat-pills-grid" style={{ margin: 0 }}>
          <div className="stat-pill">
            <div className="stat-pill-icon">
              <Clock size={18} />
            </div>
            <div className="stat-pill-info">
              <span className="stat-pill-label">Thời gian làm bài</span>
              <span className="stat-pill-value">{exam.durationMinutes} phút</span>
            </div>
          </div>

          <div className="stat-pill">
            <div className="stat-pill-icon">
              <HelpCircle size={18} />
            </div>
            <div className="stat-pill-info">
              <span className="stat-pill-label">Tổng số câu hỏi</span>
              <span className="stat-pill-value">{exam.totalQuestions} câu</span>
            </div>
          </div>

          <div className="stat-pill">
            <div className="stat-pill-icon">
              <Headphones size={18} />
            </div>
            <div className="stat-pill-info">
              <span className="stat-pill-label">Listening</span>
              <span className="stat-pill-value">{exam.listeningCount} câu</span>
            </div>
          </div>

          <div className="stat-pill">
            <div className="stat-pill-icon">
              <BookOpen size={18} />
            </div>
            <div className="stat-pill-info">
              <span className="stat-pill-label">Reading</span>
              <span className="stat-pill-value">{exam.readingCount} câu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách câu hỏi trong đề */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Danh sách câu hỏi trong đề</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Hiển thị {filteredQuestions.length} trên tổng số {exam.totalQuestions} câu hỏi.
            </span>
          </div>

          {/* Filter theo Part */}
          <select
            className="exam-select"
            value={selectedPartFilter}
            onChange={(e) => setSelectedPartFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          >
            <option value="ALL">Tất cả Part (1–7)</option>
            {[1, 2, 3, 4, 5, 6, 7].map((p) => (
              <option key={p} value={p}>
                Part {p} ({exam.partDistribution?.[p] || 0} câu)
              </option>
            ))}
          </select>
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>THỨ TỰ</th>
              <th style={{ width: '130px' }}>MÃ CÂU HỎI</th>
              <th>NỘI DUNG / TÊN CÂU HỎI</th>
              <th style={{ width: '100px' }}>PHẦN THI</th>
              <th style={{ width: '180px' }}>KỸ NĂNG (ABILITY)</th>
              <th style={{ width: '80px', textAlign: 'center' }}>ĐIỂM</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.questionId}>
                <td style={{ fontWeight: 600, color: '#94A3B8' }}>#{q.orderNo}</td>
                <td>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#F45B0B' }}>
                    {q.questionCode}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 500, color: '#0F172A' }}>{q.questionName}</div>
                </td>
                <td>
                  <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#F1F5F9', borderRadius: '4px', color: '#475569' }}>
                    Part {q.partNumber}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {q.abilityNames && q.abilityNames.length > 0 ? (
                      q.abilityNames.map((ab, i) => (
                        <span key={i} style={{ fontSize: '11px', padding: '1px 6px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: '4px' }}>
                          {ab}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>--</span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{q.points || 5}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '24px', paddingBottom: '48px' }}>
        <button type="button" className="btn-outline-gray" onClick={handleNavigateBack}>
          <ArrowLeft size={16} />
          <span>Quay lại danh sách đề thi</span>
        </button>
      </div>
    </div>
  );
};
