/**
 * Tổng hợp tất cả mock handlers theo từng feature.
 * Mỗi feature có file handler riêng trong thư mục handlers/.
 * Khi thêm mock mới: sửa đúng file feature của mình, không viết trực tiếp vào file này.
 */
import { authHandlers } from './handlers/authHandlers';
import { diagnosticHandlers } from './handlers/diagnosticHandlers';
import { moduleTestHandlers } from './handlers/moduleTestHandlers';
import { roadmapHandlers } from './handlers/roadmapHandlers';
import { profileHandlers } from './handlers/profileHandlers';
import { adminHandlers } from './handlers/adminHandlers';

export const handlers = [
    ...authHandlers,
    ...diagnosticHandlers,
    ...moduleTestHandlers,
    ...roadmapHandlers,
    ...profileHandlers,
    ...adminHandlers,
];
