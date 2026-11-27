import React, { useState, useCallback, createContext, useContext, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import './confirm-dialog.css';

/**
 * Hộp thoại xác nhận tự thiết kế thay thế window.confirm() nguyên thủy.
 * Hiển thị popup đẹp với icon cảnh báo, đồng bộ giao diện với ứng dụng.
 *
 * Cách dùng:
 *   1. Bọc App bằng <ConfirmProvider> (một lần duy nhất)
 *   2. Trong component: const confirm = useConfirm();
 *      const ok = await confirm('Bạn có chắc muốn xóa?');
 *      if (ok) { ... }
 */

interface ConfirmOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

type ConfirmFn = (messageOrOptions: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm: ConfirmFn = useCallback((input) => {
    const opts = typeof input === 'string' ? { message: input } : input;
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleResult = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="confirm-overlay" onClick={() => handleResult(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertTriangle size={28} />
            </div>
            <h3 className="confirm-title">{options.title || 'Xác nhận'}</h3>
            <p className="confirm-message">{options.message}</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-btn cancel"
                onClick={() => handleResult(false)}
              >
                {options.cancelText || 'Hủy'}
              </button>
              <button
                type="button"
                className="confirm-btn danger"
                onClick={() => handleResult(true)}
              >
                {options.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

/**
 * Hook gọi hộp thoại xác nhận từ bất kỳ component nào.
 * @example const confirm = useConfirm(); if (await confirm('Xóa?')) { ... }
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm phải được sử dụng bên trong <ConfirmProvider>');
  return ctx;
}

