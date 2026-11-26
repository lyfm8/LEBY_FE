import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
// Đăng ký interceptor xử lý lỗi HTTP tập trung trước khi ứng dụng khởi chạy
import './core/interceptors/error.interceptor';

// Khởi chạy ứng dụng React và kết nối trực tiếp API Backend
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
