import React, { useState, useEffect } from 'react';
import type { ModuleResponse } from '../../types';
import { adminModuleService } from '../../services/adminModuleService';
import {
  Save,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { ThresholdNumberInput } from './ThresholdNumberInput';

interface ModuleThresholdsViewProps {
  // Danh sách module hiện có để hiển thị và chỉnh tỷ lệ hoàn thành
  modules: ModuleResponse[];
  // Hàm làm mới lại danh sách module từ server sau khi lưu hàng loạt
  onRefresh: () => void;
  // Callback mở màn hình chỉnh sửa chi tiết module khi bấm vào tên module
  onEditModule?: (id: number) => void;
}

interface LocalThresholdItem {
  // ID định danh của module
  id: number;
  // Tên hiển thị của module
  title: string;
  // Thứ tự sư phạm của module trong lộ trình
  sequence: number;
  // Tên Part TOEIC gắn với module (có thể null)
  partName: string | null;
  // Giữ lại điểm đỗ mặc định hiện có để truyền lại khi API update yêu cầu trường bắt buộc
  defaultPassScore: number;
  // Tỷ lệ hoàn thành bài giảng tối thiểu (%) để mở bài thi vượt ải
  requiredCompletionRate: number;
  // Cờ đánh dấu dòng đang có thay đổi chưa lưu
  isDirty: boolean;
  // Cờ đánh dấu dòng đang trong quá trình gửi API lưu
  isSaving: boolean;
  // Cờ hiển thị trạng thái đã lưu thành công tạm thời
  isSavedSuccess: boolean;
}

export const ModuleThresholdsView: React.FC<ModuleThresholdsViewProps> = ({
  modules,
  onRefresh,
  onEditModule,
}) => {
  // State lưu danh sách dòng cấu hình cục bộ theo từng module
  const [items, setItems] = useState<LocalThresholdItem[]>([]);
  // State lưu từ khóa tìm kiếm lọc module theo tên hoặc Part
  const [keyword, setKeyword] = useState<string>('');

  // Đồng bộ dữ liệu cục bộ mỗi khi danh sách modules từ component cha thay đổi
  useEffect(() => {
    setItems(
      modules.map((m) => ({
        id: m.id,
        title: m.title,
        sequence: m.sequence,
        partName: m.partName,
        defaultPassScore: m.defaultPassScore ?? 65,
        requiredCompletionRate: m.requiredCompletionRate ?? 80,
        isDirty: false,
        isSaving: false,
        isSavedSuccess: false,
      }))
    );
  }, [modules]);

  // Cập nhật tạm thời tỷ lệ bài học khi quản trị viên nhập số (sẽ chuẩn hóa trong [50, 100] khi blur/lưu)
  const handleRateChange = (id: number, val: number) => {
    // Cập nhật giá trị mới và bật cờ dirty cho đúng dòng đang chỉnh
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              requiredCompletionRate: val,
              isDirty: true,
              isSavedSuccess: false,
            }
          : item
      )
    );
  };

  // Lưu thay đổi tỷ lệ hoàn thành cho một module cụ thể
  const handleSaveRow = async (id: number) => {
    // Tìm dòng dữ liệu cần lưu theo id
    const target = items.find((it) => it.id === id);
    // Thoát sớm nếu không tìm thấy dòng tương ứng
    if (!target) return;

    // Đảm bảo tỷ lệ hoàn thành gửi lên nằm trong khoảng hợp lệ 50-100%
    const safeRate = Math.max(50, Math.min(100, target.requiredCompletionRate || 50));

    // Bật trạng thái đang lưu và đồng bộ giá trị đã chuẩn hóa lên UI
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, requiredCompletionRate: safeRate, isSaving: true }
          : it
      )
    );

    try {
      // Gọi API cập nhật ngưỡng, giữ nguyên defaultPassScore hiện có của module để đáp ứng validation BE
      const res = await adminModuleService.updateModuleThresholds(id, {
        defaultPassScore: target.defaultPassScore,
        requiredCompletionRate: safeRate,
      });

      // Nếu API thành công thì tắt loading, tắt dirty và bật nhãn Đã lưu trong 3 giây
      if (res.success) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? { ...it, isSaving: false, isDirty: false, isSavedSuccess: true }
              : it
          )
        );
        // Tự động ẩn nhãn Đã lưu sau 3 giây để trở về nút Lưu mặc định
        setTimeout(() => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, isSavedSuccess: false } : it
            )
          );
        }, 3000);
      }
    } catch (error) {
      // Ghi log lỗi và thông báo khi lưu thất bại, đồng thời tắt spinner loading
      console.error('Lỗi cập nhật tỷ lệ hoàn thành:', error);
      alert('Không thể cập nhật thông số. Vui lòng thử lại!');
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isSaving: false } : it))
      );
    }
  };

  // Lưu lần lượt toàn bộ các dòng đang có thay đổi chưa lưu
  const handleSaveAllDirty = async () => {
    // Lọc ra các dòng có cờ isDirty === true
    const dirtyItems = items.filter((it) => it.isDirty);
    // Dừng lại nếu không có dòng nào thay đổi
    if (dirtyItems.length === 0) return;

    // Lưu tuần tự từng dòng đang thay đổi
    for (const item of dirtyItems) {
      await handleSaveRow(item.id);
    }
    // Làm mới dữ liệu danh sách module ở component cha
    onRefresh();
  };

  // Lọc danh sách hiển thị theo tên module hoặc tên Part khớp từ khóa tìm kiếm
  const filteredItems = items.filter(
    (it) =>
      it.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (it.partName && it.partName.toLowerCase().includes(keyword.toLowerCase()))
  );

  // Đếm tổng số dòng đang chờ lưu để hiển thị trên nút Lưu tất cả
  const totalDirty = items.filter((it) => it.isDirty).length;

  return (
    <div className="editor-pane-container">
      {/* Thanh tiêu đề và nút lưu hàng loạt */}
      <div className="editor-pane-header compact-thresholds-header">
        <div className="editor-header-left">
          <h1 className="editor-main-title">
            Bảng Tỷ Lệ Hoàn Thành Module
          </h1>
        </div>

        <div className="editor-header-right">
          {/* Nút lưu tất cả các dòng đang sửa đổi */}
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveAllDirty}
            disabled={totalDirty === 0}
          >
            <Save size={15} />
            <span>Lưu tất cả ({totalDirty})</span>
          </button>
        </div>
      </div>

      {/* Khu vực tìm kiếm và bảng tỷ lệ hoàn thành */}
      <div className="thresholds-management-body">
        {/* Thanh tìm kiếm module */}
        <div className="thresholds-filter-bar">
          <div className="search-box">
            <Search size={14} className="icon" />
            <input
              type="text"
              placeholder="Tìm kiếm module để chỉnh thông số..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* Bảng cấu hình tỷ lệ hoàn thành 4 cột căn chỉnh cân đối */}
        <div className="thresholds-table-wrapper">
          <table className="thresholds-table">
            <thead>
              <tr>
                <th className="col-seq">Thứ tự</th>
                <th className="col-module">Tên Module & Part</th>
                <th className="col-rate">Tỷ lệ bài học</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="thresholds-empty-cell">
                    Không tìm thấy module nào phù hợp với từ khóa "{keyword}".
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={item.isDirty ? 'row-dirty' : ''}
                  >
                    {/* Cột thứ tự module */}
                    <td className="col-seq font-semibold text-muted">
                      #{item.sequence}
                    </td>

                    {/* Cột tên module và thẻ Part tương ứng */}
                    <td className="col-module">
                      <div className="module-name-cell">
                        {onEditModule ? (
                          <button
                            type="button"
                            className="name"
                            onClick={() => onEditModule(item.id)}
                            title="Bấm để mở chỉnh sửa chi tiết Module"
                          >
                            {item.title}
                          </button>
                        ) : (
                          <span className="name">{item.title}</span>
                        )}
                        {item.partName && (
                          <span className="part-tag">{item.partName}</span>
                        )}
                      </div>
                    </td>

                    {/* Cột nhập tỷ lệ hoàn thành bài học tối thiểu */}
                    <td className="col-rate">
                      <div className="thresholds-rate-cell">
                        <ThresholdNumberInput
                          value={item.requiredCompletionRate}
                          onChange={(val) => handleRateChange(item.id, val)}
                          unit="%"
                          min={50}
                          max={100}
                          clampOnBlur
                          ariaLabel={`Tỷ lệ bài học của ${item.title}`}
                        />
                      </div>
                    </td>

                    {/* Cột thao tác lưu từng dòng */}
                    <td className="col-actions">
                      {item.isSavedSuccess ? (
                        <span className="thresholds-saved-badge">
                          <CheckCircle2 size={15} />
                          <span>Đã lưu</span>
                        </span>
                      ) : (
                        <div className="admin-actions-cell is-center">
                          <button
                            type="button"
                            className={`admin-btn-action ${item.isDirty ? 'is-dirty' : ''}`}
                            onClick={() => handleSaveRow(item.id)}
                            disabled={!item.isDirty || item.isSaving}
                            title="Lưu tỷ lệ hoàn thành"
                          >
                            <Save size={14} />
                            <span>{item.isSaving ? 'Đang lưu...' : 'Lưu'}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
