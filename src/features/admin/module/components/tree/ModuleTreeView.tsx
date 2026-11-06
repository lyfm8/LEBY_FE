import React, { useState, useMemo } from 'react';
import type { ModuleResponse, EditorActiveView } from '../../types';
import { ModuleTreeItem } from './ModuleTreeItem';
import { Plus, Sliders, Search, FolderTree, RefreshCw, PanelLeftClose } from 'lucide-react';

interface ModuleTreeViewProps {
  modules: ModuleResponse[];
  activeView: EditorActiveView;
  onSelectView: (view: EditorActiveView) => void;
  onDeleteModule: (id: number) => void;
  onDeleteLesson: (lessonId: number, moduleId: number) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onToggleCollapse?: () => void;
}

export const ModuleTreeView: React.FC<ModuleTreeViewProps> = ({
  modules,
  activeView,
  onSelectView,
  onDeleteModule,
  onDeleteLesson,
  onRefresh,
  isLoading,
  onToggleCollapse,
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Lọc Module theo từ khóa tìm kiếm
  const filteredModules = useMemo(() => {
    if (!searchKeyword.trim()) return modules;
    const lower = searchKeyword.toLowerCase();
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(lower) ||
        (m.partName && m.partName.toLowerCase().includes(lower)) ||
        (m.lessons && m.lessons.some((l) => l.title.toLowerCase().includes(lower)))
    );
  }, [modules, searchKeyword]);

  const isConfigActive = activeView.type === 'MODULE_CONFIGS';

  return (
    <div className="module-tree-container">
      {/* 1. Header Toolbar */}
      <div className="module-tree-header">
        <div className="module-tree-title-row">
          <div className="title-wrapper">
            <FolderTree size={18} className="text-orange" />
            <h2 className="tree-title">Cấu trúc Mô-đun</h2>
          </div>
          <div className="tree-header-actions">
            <button
              type="button"
              className="tree-icon-btn"
              title="Làm mới danh sách"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
            </button>
            {onToggleCollapse && (
              <button
                type="button"
                className="tree-icon-btn"
                title="Thu gọn cây mô-đun"
                onClick={onToggleCollapse}
              >
                <PanelLeftClose size={15} />
              </button>
            )}
          </div>
        </div>

        {/* 2. Top Action Buttons */}
        <div className="tree-top-actions">
          <button
            type="button"
            className="btn-create-module"
            onClick={() => onSelectView({ type: 'MODULE_CREATE' })}
          >
            <Plus size={16} />
            <span>Thêm Module</span>
          </button>

          <button
            type="button"
            className={`btn-config-thresholds ${isConfigActive ? 'active' : ''}`}
            onClick={() => onSelectView({ type: 'MODULE_CONFIGS' })}
            title="Xem & điều chỉnh điểm chuẩn và tỷ lệ hoàn thành các Module"
          >
            <Sliders size={15} />
            <span>Cấu hình thông số</span>
          </button>
        </div>

        {/* 3. Search Box */}
        <div className="tree-search-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="tree-search-input"
            placeholder="Tìm module, bài học..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchKeyword('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 4. Tree Content List */}
      <div className="module-tree-body">
        {filteredModules.length > 0 ? (
          filteredModules.map((mod) => (
            <ModuleTreeItem
              key={mod.id}
              moduleData={mod}
              activeView={activeView}
              onSelectView={onSelectView}
              onDeleteModule={onDeleteModule}
              onDeleteLesson={onDeleteLesson}
            />
          ))
        ) : (
          <div className="tree-empty-state">
            {searchKeyword ? (
              <>
                <p>Không tìm thấy mô-đun nào khớp với "{searchKeyword}".</p>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setSearchKeyword('')}
                >
                  Xóa bộ lọc
                </button>
              </>
            ) : (
              <p className="tree-empty-text">Chưa có mô-đun nào trong danh sách.</p>
            )}
          </div>
        )}
      </div>

      {/* 5. Footer tóm tắt */}
      <div className="module-tree-footer">
        <span>Tổng cộng: {modules.length} Module</span>
      </div>
    </div>
  );
};
