import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './toast.css';

/**
 * Hệ thống thông báo Toast tự xây dựng (không cần thư viện bên ngoài).
 * Hiển thị thanh thông báo nhỏ ở góc trên bên phải, tự biến mất sau 3 giây.
 *
 * Cách dùng:
 *   1. Bọc App bằng <ToastProvider> (một lần duy nhất)
 *   2. Trong component: const toast = useToast(); toast.success('Thành công!');
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

// Thời gian toast tự biến mất (ms)
const AUTO_DISMISS_MS = 3000;

function ToastItemComponent({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div className={`toast-item toast-${item.type}`}>
      <span className="toast-icon">{TOAST_ICONS[item.type]}</span>
      <span className="toast-message">{item.message}</span>
      <button type="button" className="toast-close" onClick={() => onDismiss(item.id)}>
        <X size={14} />
      </button>
    </div>
  );
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const value: ToastContextValue = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info: (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container hiển thị toast ở góc trên bên phải */}
      <div className="toast-container">
        {toasts.map(item => (
          <ToastItemComponent key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook gọi toast thông báo từ bất kỳ component nào.
 * @example const toast = useToast(); toast.success('Lưu thành công!');
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được sử dụng bên trong <ToastProvider>');
  return ctx;
}

