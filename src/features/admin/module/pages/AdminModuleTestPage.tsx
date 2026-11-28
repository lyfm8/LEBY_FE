import React, { useState, useEffect } from 'react';
import { useModuleTestOverview, type ModuleTestStatusFilter } from '../hooks/useModuleTestOverview';
import { ModuleTestView } from '../components/test/ModuleTestView';
import { adminModuleService } from '../services/adminModuleService';
import type { AbilityResponse, PartResponse } from '@/features/admin/part/types';
import {
  Search,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Shuffle,
  FileCheck2,
} from 'lucide-react';
import '../admin-module.css';

/**
 * Trang quản lý tổng quan và cấu hình Bài thi vượt ải cho toàn bộ Mô-đun.
 * Hiển thị danh sách mô-đun kèm trạng thái đã có đề / chưa có đề, số câu hỏi, thời gian thi
 * và cho phép bấm vào từng mô-đun để cấu hình chi tiết.
 */
export const AdminModuleTestPage: React.FC = () => {
  // Gọi custom hook quản lý danh sách tổng quan, bộ lọc đồng bộ URL và mô-đun đang chọn
  const {
    items,
    filteredItems,
    summary,
    isLoading,
    error,
    keyword,
    partId,
    statusFilter,
    selectedModuleId,
    setKeyword,
    setPartId,
    setStatusFilter,
    resetFilters,
    selectModule,
    refetch,
  } = useModuleTestOverview();

  // State lưu danh sách Parts và Abilities phục vụ bộ lọc và Modal chọn câu hỏi
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);

  // Nạp danh sách Parts & Abilities dùng chung 1 lần khi mở trang
  useEffect(() => {
    adminModuleService
      .getParts()
      .then(async (res: unknown) => {
        const responseData = res as { data?: PartResponse[] | { data?: PartResponse[] } };
        const partList: PartResponse[] = Array.isArray(res)
          ? (res as PartResponse[])
          : Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray((responseData?.data as { data?: PartResponse[] })?.data)
          ? (responseData.data as { data: PartResponse[] }).data
          : [];

        if (partList.length > 0) {
          setParts(partList);
          const allAbilities: AbilityResponse[] = [];
          for (const part of partList) {
            try {
              const abRes: unknown = await adminModuleService.getAbilities(part.id);
              const abResponseData = abRes as { data?: AbilityResponse[] };
              const abList = Array.isArray(abRes)
                ? (abRes as AbilityResponse[])
                : Array.isArray(abResponseData?.data)
                ? abResponseData.data
                : [];
              allAbilities.push(...abList);
            } catch {
              // Bỏ qua nếu một Part riêng lẻ không tải được Ability
            }
          }
          setAbilities(allAbilities);
        }
      })
      .catch(() => {
        // Không chặn trang chính nếu tải danh mục bộ lọc lỗi tạm thời
      });
  }, []);

  // Tìm thông tin mô-đun đang được chọn để cấu hình chi tiết (nếu có moduleId trên URL)
  const selectedItem = items.find((item) => item.moduleId === selectedModuleId) ?? null;

  // Nếu người dùng đã chọn một mô-đun → hiển thị trực tiếp giao diện cấu hình chi tiết
  if (selectedModuleId !== null) {
    return (
      <div className="admin-page-container">
        <div className="mt-detail-page-shell">
          <ModuleTestView
            moduleId={selectedModuleId}
            moduleTitle={selectedItem?.moduleTitle ?? `Mô-đun #${selectedModuleId}`}
            passScore={selectedItem?.defaultPassScore}
            requiredCompletionRate={selectedItem?.requiredCompletionRate}
            parts={parts}
            abilities={abilities}
            onBack={() => selectModule(null)}
            onSaved={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Tiêu đề trang chuẩn mực hệ thống quản trị LEBY */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Bài thi vượt ải mô-đun</h1>
          <p className="admin-page-subtitle">
            Thiết lập thời gian làm bài, số lượng câu hỏi, chế độ xáo trộn và bộ câu hỏi chốt chặn cho từng mô-đun
          </p>
        </div>
      </div>

      {/* Thanh chỉ số tổng quan nhanh */}
      <div className="mt-overview-stats">
        <div className="mt-stat-card">
          <span className="mt-stat-label">Tổng số mô-đun</span>
          <strong className="mt-stat-value">{summary.total}</strong>
        </div>
        <div className="mt-stat-card mt-stat-success">
          <span className="mt-stat-label">Đã có đề thi</span>
          <strong className="mt-stat-value">{summary.configured}</strong>
        </div>
        <div className="mt-stat-card mt-stat-warning">
          <span className="mt-stat-label">Chưa có đề thi</span>
          <strong className="mt-stat-value">{summary.unconfigured}</strong>
        </div>
        <div className="mt-stat-card mt-stat-muted">
          <span className="mt-stat-label">Thiếu bài giảng</span>
          <strong className="mt-stat-value">{summary.missingLessons}</strong>
        </div>
      </div>

      {/* Thanh công cụ tìm kiếm và lọc trạng thái (đồng bộ URL) */}
      <div className="mt-filter-bar">
        <div className="pq-search-box mt-search-grow">
          <Search size={15} className="pq-search-icon" />
          <input
            type="text"
            className="pq-search-input"
            placeholder="Tìm theo tên mô-đun, Part hoặc năng lực..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Bộ lọc theo Part */}
        <select
          className="pq-filter-select"
          value={partId ?? ''}
          onChange={(e) => setPartId(e.target.value ? Number(e.target.value) : null)}
          aria-label="Lọc theo Part"
        >
          <option value="">Tất cả các Part</option>
          {parts.map((part) => (
            <option key={part.id} value={part.id}>
              {part.name}
            </option>
          ))}
        </select>

        {/* Bộ lọc theo trạng thái Đã có đề / Chưa có đề */}
        <select
          className="pq-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ModuleTestStatusFilter)}
          aria-label="Lọc theo trạng thái đề thi"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="CONFIGURED">Đã có đề thi</option>
          <option value="UNCONFIGURED">Chưa có đề thi</option>
        </select>

        {/* Nút đặt lại toàn bộ bộ lọc tìm kiếm trên cùng một hàng */}
        <button
          type="button"
          className="btn-secondary compact mt-reset-btn"
          onClick={resetFilters}
          title="Đặt lại toàn bộ bộ lọc"
        >
          <RotateCcw size={14} />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Bảng danh sách mô-đun kèm đủ 4 trạng thái Loading / Error / Empty / Success */}
      <div className="mt-table-card">
        {/* Trạng thái 1: Skeleton khi đang tải dữ liệu */}
        {isLoading && (
          <div className="pq-skeleton-list mt-table-skeleton">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="pq-skeleton-row" />
            ))}
          </div>
        )}

        {/* Trạng thái 2: Báo lỗi kèm nút Thử lại */}
        {!isLoading && error && (
          <div className="pq-state-box pq-state-error">
            <AlertTriangle size={28} />
            <p>{error}</p>
            <button type="button" className="btn-secondary" onClick={() => void refetch()}>
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Trạng thái 3: Danh sách trống */}
        {!isLoading && !error && filteredItems.length === 0 && (
          <div className="pq-state-box">
            <FileCheck2 size={32} />
            <p>Không tìm thấy mô-đun nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}

        {/* Trạng thái 4: Bảng dữ liệu hoàn chỉnh */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="mt-table-scroll">
            <table className="mt-overview-table">
              <thead>
                <tr>
                  <th>Mô-đun</th>
                  <th>Trạng thái đề thi</th>
                  <th>Số câu hỏi</th>
                  <th>Thời gian</th>
                  <th>Phương thức</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.moduleId}>
                    {/* Cột tên mô-đun, Part, năng lực và cảnh báo nếu chưa có bài giảng */}
                    <td>
                      <div className="mt-cell-module">
                        <div className="mt-cell-module-top">
                          <span className="tree-sequence-badge">#{item.sequence}</span>
                          <span className="mt-cell-module-title">{item.moduleTitle}</span>
                          {item.hasNoLessonsWarning && (
                            <span
                              className="pq-badge mt-badge-mismatch"
                              title="Mô-đun chưa có bài giảng lý thuyết nào"
                            >
                              <AlertTriangle size={11} />
                              <span>Chưa có bài giảng</span>
                            </span>
                          )}
                        </div>
                        <div className="pq-meta-tags">
                          {item.partName && <span className="pq-meta-pill">{item.partName}</span>}
                          {item.abilityNames.slice(0, 2).map((ab) => (
                            <span key={ab} className="pq-meta-pill pq-meta-ability">
                              {ab}
                            </span>
                          ))}
                          {item.abilityNames.length > 2 && (
                            <span className="pq-meta-pill">+{item.abilityNames.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cột trạng thái Đã có đề / Chưa có đề */}
                    <td>
                      {item.hasTestConfigured ? (
                        <span className="mt-status-pill is-ready">
                          <CheckCircle2 size={13} />
                          <span>Đã có đề thi</span>
                        </span>
                      ) : (
                        <span className="mt-status-pill is-pending">
                          <AlertTriangle size={13} />
                          <span>Chưa có đề thi</span>
                        </span>
                      )}
                    </td>

                    {/* Cột số câu hỏi hiện có / mục tiêu */}
                    <td>
                      <div className="mt-cell-metric">
                        <Award size={14} className="text-orange" />
                        <span>
                          {item.selectionMode === 'RANDOM_BY_ABILITY'
                            ? `${item.questionCount} câu (ngẫu nhiên)`
                            : `${item.currentQuestionCount} / ${item.questionCount} câu`}
                        </span>
                      </div>
                    </td>

                    {/* Cột thời gian làm bài */}
                    <td>
                      <div className="mt-cell-metric">
                        <Clock size={14} className="text-blue" />
                        <span>{item.durationMinutes} phút</span>
                      </div>
                    </td>

                    {/* Cột chế độ chọn câu hỏi & xáo trộn */}
                    <td>
                      <div className="mt-cell-mode">
                        <span className="pq-meta-pill">
                          {item.selectionMode === 'RANDOM_BY_ABILITY'
                            ? 'Ngẫu nhiên theo năng lực'
                            : 'Chọn thủ công'}
                        </span>
                        {item.shuffleQuestions && (
                          <span className="mt-shuffle-tag" title="Tự động xáo trộn câu hỏi và đáp án">
                            <Shuffle size={12} />
                            <span>Xáo trộn</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cột nút mở màn hình cấu hình */}
                    <td className="text-right">
                      <div className="admin-actions-cell is-end">
                        <button
                          type="button"
                          className="admin-btn-action"
                          onClick={() => selectModule(item.moduleId)}
                        >
                          <SlidersHorizontal size={14} />
                          <span>Cấu hình đề</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
