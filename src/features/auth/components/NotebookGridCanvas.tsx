import type React from 'react';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Props cho component NotebookGridCanvas
 */
export interface NotebookGridCanvasProps {
    /** Tham chiếu đến container nửa bên phải để theo dõi tọa độ chuột xuyên suốt vùng form */
    containerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Cấu trúc lưu trạng thái vật lý của một nút giao điểm trên lưới ô ly quyển vở
 */
interface GridNode {
    /** Tọa độ X gốc cố định trên lưới */
    baseX: number;
    /** Tọa độ Y gốc cố định trên lưới */
    baseY: number;
    /** Tọa độ X hiện tại sau khi bị đẩy hoặc đàn hồi */
    x: number;
    /** Tọa độ Y hiện tại sau khi bị đẩy hoặc đàn hồi */
    y: number;
    /** Vận tốc di chuyển theo trục X */
    vx: number;
    /** Vận tốc di chuyển theo trục Y */
    vy: number;
    /** Mức độ kích hoạt năng lượng (0..1) dùng để đổi màu và kích thước hạt */
    energy: number;
    /** Pha dao động riêng giúp các nút không chuyển động đồng loạt cứng nhắc */
    phase: number;
}

/**
 * Cấu trúc lưu trạng thái một vòng sóng lan tỏa khi người dùng click chuột
 */
interface ClickRipple {
    /** Tâm X nơi phát sinh vòng sóng */
    x: number;
    /** Tâm Y nơi phát sinh vòng sóng */
    y: number;
    /** Bán kính hiện tại của vòng sóng */
    radius: number;
    /** Bán kính tối đa trước khi vòng sóng tan biến */
    maxRadius: number;
    /** Cường độ lực đẩy còn lại (giảm dần từ 1 về 0) */
    strength: number;
}

// Kích thước mỗi ô vuông ô ly quyển vở (đơn vị px)
const GRID_CELL_SIZE = 28;
// Bán kính vùng ảnh hưởng trường lực quanh con trỏ chuột (đơn vị px)
const INTERACTION_RADIUS = 165;
// Độ cứng lò xo kéo nút lưới quay về vị trí ô ly ban đầu
const SPRING_STIFFNESS = 0.095;
// Hệ số giảm chấn giúp chuyển động hồi vị mượt và không rung lắc kéo dài
const SPRING_DAMPING = 0.82;
// Thời gian chờ sau khi chuột ngừng di chuyển để đưa canvas về trạng thái nghỉ (ms)
const IDLE_TIMEOUT_MS = 1200;

/**
 * Leaf Component: Vẽ nền vở ô ly tương tác vật lý đàn hồi kiểu Antigravity (Biến thể B).
 * Toàn bộ tọa độ chuột và vòng lặp vẽ được quản lý qua useRef + requestAnimationFrame
 * nhằm đạt 60fps và không gây re-render React khi người dùng nhập form.
 *
 * @param props Tham chiếu containerRef của cột chứa form
 */
export const NotebookGridCanvas: React.FC<NotebookGridCanvasProps> = ({ containerRef }) => {
    // Tham chiếu trực tiếp đến thẻ canvas dùng để lấy context 2D vẽ nền
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Thiết lập vòng đời Canvas, lắng nghe chuột trên containerRef và tự dọn dẹp khi unmount
    useEffect(() => {
        // Lấy phần tử container bao ngoài và phần tử canvas hiện tại
        const containerEl = containerRef.current;
        const canvasEl = canvasRef.current;
        // Thoát sớm nếu một trong hai DOM node chưa sẵn sàng
        if (!containerEl || !canvasEl) return;

        // Lấy ngữ cảnh đồ họa 2D của canvas
        const ctx = canvasEl.getContext('2d');
        // Thoát sớm nếu trình duyệt không hỗ trợ context 2D
        if (!ctx) return;

        // Kiểm tra tùy chọn giảm chuyển động của hệ điều hành (Accessibility)
        const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        // Kiểm tra thiết bị cảm ứng không có con trỏ hover chính xác
        const coarsePointerQuery = window.matchMedia('(pointer: coarse)');

        // Biến theo dõi trạng thái con trỏ chuột bên trong container
        const pointer = {
            x: -9999,
            y: -9999,
            isActive: false,
            lastMoveAt: 0,
        };

        // Lưu kích thước khung vẽ hiện tại và số hàng/cột của lưới ô ly
        let viewWidth = 0;
        let viewHeight = 0;
        let cols = 0;
        let rows = 0;
        // Mảng phẳng chứa toàn bộ giao điểm lưới ô ly
        let nodes: GridNode[] = [];
        // Danh sách các vòng sóng lan tỏa khi người dùng click
        let ripples: ClickRipple[] = [];
        // Bộ đếm thời gian phục vụ dao động sóng nhẹ quanh chuột
        let tick = 0;
        // ID của requestAnimationFrame hiện tại để hủy sạch khi ngủ hoặc unmount
        let rafId: number | null = null;

        /**
         * Khởi tạo lại kích thước canvas theo DPI màn hình và tính lại toàn bộ nút lưới ô ly.
         */
        const rebuildGrid = () => {
            // Giới hạn devicePixelRatio tối đa 2 để vừa sắc nét Retina vừa nhẹ GPU
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            // Đo kích thước hiển thị thực tế của container bên phải
            const rect = containerEl.getBoundingClientRect();
            // Bỏ qua nếu container đang ẩn hoặc kích thước bằng 0
            if (rect.width <= 0 || rect.height <= 0) return;
            // Tránh dựng lại mảng nút lưới nếu kích thước thay đổi dưới 1px để giữ mượt xung sóng hiện tại
            if (
                Math.abs(rect.width - viewWidth) < 1 &&
                Math.abs(rect.height - viewHeight) < 1 &&
                nodes.length > 0
            ) {
                return;
            }
            // Cập nhật chiều rộng và chiều cao vùng vẽ
            viewWidth = rect.width;
            viewHeight = rect.height;

            // Gán kích thước pixel vật lý cho canvas theo tỉ lệ DPI
            canvasEl.width = Math.round(viewWidth * dpr);
            canvasEl.height = Math.round(viewHeight * dpr);
            // Chuẩn hóa hệ trục tọa độ về pixel CSS bình thường
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Tính số cột và số hàng dư 2 đơn vị để đường kẻ phủ kín mép phải và đáy
            cols = Math.ceil(viewWidth / GRID_CELL_SIZE) + 2;
            rows = Math.ceil(viewHeight / GRID_CELL_SIZE) + 2;
            // Đặt lại mảng nút lưới mới theo kích thước khung hiện tại
            nodes = [];

            // Duyệt từng hàng và từng cột để tạo các giao điểm neo cố định
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // Tính tọa độ X gốc của giao điểm
                    const baseX = c * GRID_CELL_SIZE;
                    // Tính tọa độ Y gốc của giao điểm
                    const baseY = r * GRID_CELL_SIZE;
                    // Thêm nút mới với vận tốc và năng lượng khởi đầu bằng 0
                    nodes.push({
                        baseX,
                        baseY,
                        x: baseX,
                        y: baseY,
                        vx: 0,
                        vy: 0,
                        energy: 0,
                        phase: c * 0.45 + r * 0.35,
                    });
                }
            }
        };

        /**
         * Vẽ một khung hình lưới ô ly và các hạt giao điểm theo trạng thái hiện tại.
         */
        const drawFrame = () => {
            // Xóa sạch khung hình cũ trước khi vẽ khung hình mới
            ctx.clearRect(0, 0, viewWidth, viewHeight);
            // Đặt độ dày nét kẻ mảnh giống đường kẻ vở học sinh
            ctx.lineWidth = 1;

            // Vẽ các đoạn lưới ngang và dọc nối giữa các giao điểm lân cận
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // Lấy giao điểm hiện tại theo chỉ số mảng phẳng
                    const current = nodes[r * cols + c];

                    // Nối đường ngang tới giao điểm liền kề bên phải nếu chưa tới biên cột
                    if (c + 1 < cols) {
                        // Lấy giao điểm bên phải
                        const right = nodes[r * cols + (c + 1)];
                        // Lấy mức năng lượng lớn hơn giữa hai đầu đoạn thẳng
                        const edgeEnergy = Math.max(current.energy, right.energy);
                        // Chuyển sắc nét kẻ từ xám vở sang cam dịu khi nằm trong vùng lan tỏa
                        ctx.strokeStyle =
                            edgeEnergy > 0.05
                                ? `rgba(249, 115, 22, ${0.14 + 0.34 * edgeEnergy})`
                                : 'rgba(148, 163, 184, 0.22)';
                        // Bắt đầu vẽ đường thẳng ngang
                        ctx.beginPath();
                        ctx.moveTo(current.x, current.y);
                        ctx.lineTo(right.x, right.y);
                        ctx.stroke();
                    }

                    // Nối đường dọc tới giao điểm liền kề phía dưới nếu chưa tới biên hàng
                    if (r + 1 < rows) {
                        // Lấy giao điểm ngay bên dưới
                        const down = nodes[(r + 1) * cols + c];
                        // Lấy mức năng lượng lớn hơn giữa hai đầu đoạn thẳng
                        const edgeEnergy = Math.max(current.energy, down.energy);
                        // Chuyển sắc nét kẻ từ xám vở sang cam dịu khi nằm trong vùng lan tỏa
                        ctx.strokeStyle =
                            edgeEnergy > 0.05
                                ? `rgba(249, 115, 22, ${0.14 + 0.34 * edgeEnergy})`
                                : 'rgba(148, 163, 184, 0.22)';
                        // Bắt đầu vẽ đường thẳng dọc
                        ctx.beginPath();
                        ctx.moveTo(current.x, current.y);
                        ctx.lineTo(down.x, down.y);
                        ctx.stroke();
                    }
                }
            }

            // Vẽ các hạt giao điểm hướng tâm kiểu Antigravity trong vùng đang kích hoạt
            for (let i = 0; i < nodes.length; i++) {
                // Lấy nút giao điểm thứ i
                const node = nodes[i];
                // Bỏ qua các nút đang ở trạng thái nghỉ để tránh vẽ thừa
                if (node.energy < 0.04) continue;

                // Tính góc hướng tâm từ vị trí chuột tới giao điểm để xoay hạt tự nhiên
                const angle = pointer.isActive ? Math.atan2(node.y - pointer.y, node.x - pointer.x) : 0;
                // Tính chiều dài hạt tỉ lệ thuận với mức năng lượng lan tỏa
                const pillLength = 2.4 + node.energy * 4.8;
                // Độ dày hạt cố định 2.4px giúp giữ nét mảnh tinh tế
                const pillThickness = 2.4;

                // Lưu trạng thái hệ trục trước khi xoay riêng cho hạt
                ctx.save();
                // Dịch tâm vẽ đến vị trí hiện tại của giao điểm
                ctx.translate(node.x, node.y);
                // Xoay hạt theo phương lan tỏa từ tâm chuột
                ctx.rotate(angle);
                // Tô màu cam thương hiệu với độ trong suốt tăng dần theo năng lượng
                ctx.fillStyle = `rgba(249, 115, 22, ${0.24 + node.energy * 0.68})`;

                // Dùng roundRect nếu trình duyệt hỗ trợ, fallback sang fillRect để tương thích tuyệt đối
                if (typeof ctx.roundRect === 'function') {
                    ctx.beginPath();
                    ctx.roundRect(-pillLength * 0.5, -pillThickness * 0.5, pillLength, pillThickness, 1.2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-pillLength * 0.5, -pillThickness * 0.5, pillLength, pillThickness);
                }

                // Khôi phục lại hệ trục tọa độ gốc sau khi vẽ xong hạt
                ctx.restore();
            }
        };

        /**
         * Cập nhật một bước vật lý lò xo, lực đẩy chuột và kiểm tra điều kiện nghỉ (idle-sleep).
         *
         * @returns true nếu vẫn còn chuyển động cần tiếp tục vòng lặp animation, false nếu đã ổn định
         */
        const stepPhysics = (): boolean => {
            // Nếu bật reduced-motion thì không chạy vật lý mà giữ nguyên vị trí gốc
            if (motionMediaQuery.matches) {
                return false;
            }

            // Tăng pha thời gian phục vụ gợn sóng quanh con trỏ
            tick += 0.04;
            // Lấy mốc thời gian hiện tại để kiểm tra chuột có vừa di chuyển gần đây không
            const now = performance.now();
            // Chỉ duy trì dao động thở nhẹ khi chuột đang hoạt động gần đây hoặc còn sóng click
            const isRecentlyActive = pointer.isActive && now - pointer.lastMoveAt < IDLE_TIMEOUT_MS;
            // Cờ theo dõi xem khung hình này có bất kỳ nút nào còn đang chuyển động đáng kể không
            let hasActiveMotion = isRecentlyActive || ripples.length > 0;

            // Cập nhật bán kính và làm suy giảm dần các vòng sóng click đang chạy
            for (let i = ripples.length - 1; i >= 0; i--) {
                // Mở rộng bán kính sóng lan tỏa ra ngoài
                ripples[i].radius += 5.0;
                // Giảm dần cường độ sóng theo từng khung hình
                ripples[i].strength *= 0.955;
                // Loại bỏ sóng khi đã vượt bán kính tối đa hoặc quá mờ
                if (ripples[i].radius > ripples[i].maxRadius || ripples[i].strength < 0.03) {
                    ripples.splice(i, 1);
                }
            }

            // Tính toán lực đẩy, lực kéo lò xo và năng lượng cho từng nút giao điểm
            for (let i = 0; i < nodes.length; i++) {
                // Lấy tham chiếu tới nút đang xét
                const node = nodes[i];
                // Mức năng lượng mục tiêu của nút trong khung hình này
                let targetEnergy = 0;
                // Độ lệch thở nhẹ quanh điểm neo chỉ bật khi đang có tương tác để khi nghỉ về 0 tuyệt đối
                const floatX = isRecentlyActive ? Math.sin(tick + node.phase) * 0.55 : 0;
                const floatY = isRecentlyActive ? Math.cos(tick * 0.9 + node.phase) * 0.55 : 0;

                // Tính lực đẩy hướng tâm từ con trỏ chuột (chỉ áp dụng cho thiết bị có chuột chính xác)
                if (pointer.isActive && !coarsePointerQuery.matches) {
                    // Khoảng cách theo trục X và Y từ chuột đến nút
                    const dx = node.x - pointer.x;
                    const dy = node.y - pointer.y;
                    // Khoảng cách Euclid từ chuột đến nút
                    const dist = Math.hypot(dx, dy);

                    // Chỉ tác động lực lên các nút nằm trong bán kính ảnh hưởng
                    if (dist < INTERACTION_RADIUS && dist > 0.001) {
                        // Hệ số suy giảm tuyến tính (gần tâm = 1, ngoài rìa = 0)
                        const proximity = 1 - dist / INTERACTION_RADIUS;
                        // Điều biến gợn sóng đồng tâm tạo cảm giác lan tỏa như mặt nước/trường lực
                        const waveMod = 1 + 0.25 * Math.sin(dist * 0.09 - tick * 3.4);
                        // Tính độ lớn lực đẩy đàn hồi
                        const pushForce = proximity * proximity * 1.75 * waveMod;
                        // Cộng xung lực đẩy ra xa tâm chuột vào vận tốc
                        node.vx += (dx / dist) * pushForce;
                        node.vy += (dy / dist) * pushForce;
                        // Cập nhật mức năng lượng mục tiêu theo độ gần con trỏ
                        targetEnergy = Math.max(targetEnergy, proximity);
                    }
                }

                // Tính thêm lực xung kích từ các vòng sóng khi người dùng click chuột
                for (let k = 0; k < ripples.length; k++) {
                    // Lấy vòng sóng thứ k
                    const ripple = ripples[k];
                    // Tính khoảng cách từ tâm vòng sóng đến nút
                    const dx = node.x - ripple.x;
                    const dy = node.y - ripple.y;
                    const dist = Math.hypot(dx, dy);
                    // Đo khoảng cách từ nút tới dải rìa vòng sóng hiện tại
                    const bandDist = Math.abs(dist - ripple.radius);

                    // Nút nằm trong dải sóng dày 38px sẽ bị hất nhẹ và phát sáng cam
                    if (bandDist < 38 && dist > 0.001) {
                        // Cường độ lực đẩy tại vị trí mép sóng
                        const wavePush = (1 - bandDist / 38) * ripple.strength * 2.6;
                        // Cộng lực sóng vào vận tốc nút
                        node.vx += (dx / dist) * wavePush;
                        node.vy += (dy / dist) * wavePush;
                        // Kích sáng năng lượng hạt khi sóng đi qua
                        targetEnergy = Math.max(targetEnergy, (1 - bandDist / 38) * ripple.strength);
                    }
                }

                // Lực đàn hồi Hooke kéo nút trở về đúng tọa độ ô ly gốc (baseX, baseY)
                const ax = (node.baseX + floatX - node.x) * SPRING_STIFFNESS;
                const ay = (node.baseY + floatY - node.y) * SPRING_STIFFNESS;
                // Cập nhật vận tốc kèm ma sát giảm chấn
                node.vx = (node.vx + ax) * SPRING_DAMPING;
                node.vy = (node.vy + ay) * SPRING_DAMPING;
                // Cập nhật tọa độ mới cho nút
                node.x += node.vx;
                node.y += node.vy;

                // Tính độ lệch thực tế so với vị trí gốc để đồng bộ độ sáng khi nút đang hồi vị
                const displacement = Math.hypot(node.x - node.baseX, node.y - node.baseY);
                const nextEnergyTarget = Math.max(targetEnergy, Math.min(displacement / 14, 1));
                // Làm mượt biến đổi năng lượng để ánh sáng tắt mở êm mắt
                node.energy += (nextEnergyTarget - node.energy) * 0.18;

                // Nếu bất kỳ nút nào vẫn còn độ lệch hoặc năng lượng chưa tắt hẳn thì tiếp tục vẽ
                if (
                    !hasActiveMotion &&
                    (displacement > 0.05 || Math.abs(node.vx) > 0.02 || Math.abs(node.vy) > 0.02 || node.energy > 0.01)
                ) {
                    hasActiveMotion = true;
                }
            }

            return hasActiveMotion;
        };

        /**
         * Vòng lặp animation chính; tự dừng khi hệ thống về trạng thái nghỉ hoàn toàn.
         */
        const runAnimationLoop = () => {
            // Tiến hành một bước mô phỏng vật lý và kiểm tra còn chuyển động không
            const shouldContinue = stepPhysics();
            // Vẽ lại khung hình lưới ô ly hiện tại
            drawFrame();

            // Chỉ lên lịch khung hình kế tiếp khi còn tương tác hoặc nút chưa hồi vị xong
            if (shouldContinue) {
                rafId = window.requestAnimationFrame(runAnimationLoop);
            } else {
                // Khi đã nghỉ hẳn, xóa rafId để đánh dấu loop đã tạm ngủ (0% CPU)
                rafId = null;
            }
        };

        /**
         * Đánh thức vòng lặp animation nếu nó đang ở trạng thái ngủ.
         */
        const wakeUpLoop = () => {
            // Không khởi chạy loop nếu người dùng bật tùy chọn giảm chuyển động
            if (motionMediaQuery.matches) return;
            // Nếu chưa có khung hình nào đang xếp hàng thì khởi động lại loop
            if (rafId === null) {
                rafId = window.requestAnimationFrame(runAnimationLoop);
            }
        };

        /**
         * Xử lý sự kiện di chuyển con trỏ chuột trên toàn vùng nửa phải.
         *
         * @param event Sự kiện PointerEvent từ container
         */
        const handlePointerMove = (event: PointerEvent) => {
            // Bỏ qua nếu là thao tác chạm cảm ứng để ưu tiên mượt khi cuộn trang
            if (event.pointerType === 'touch') return;
            // Lấy tọa độ khung container để quy đổi sang tọa độ cục bộ trên canvas
            const rect = containerEl.getBoundingClientRect();
            pointer.x = event.clientX - rect.left;
            pointer.y = event.clientY - rect.top;
            pointer.isActive = true;
            pointer.lastMoveAt = performance.now();
            // Đánh thức vòng lặp vẽ nếu đang ngủ
            wakeUpLoop();
        };

        /**
         * Xử lý sự kiện nhấn chuột để tạo vòng sóng lan tỏa từ vị trí click.
         *
         * @param event Sự kiện PointerEvent từ container
         */
        const handlePointerDown = (event: PointerEvent) => {
            // Không tạo sóng nếu đang bật chế độ giảm chuyển động
            if (motionMediaQuery.matches) return;
            // Quy đổi tọa độ click sang tọa độ cục bộ bên trong container
            const rect = containerEl.getBoundingClientRect();
            // Thêm vòng sóng mới tại tâm điểm vừa nhấn
            ripples.push({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                radius: 2,
                maxRadius: INTERACTION_RADIUS * 1.7,
                strength: 0.95,
            });
            pointer.lastMoveAt = performance.now();
            // Đánh thức vòng lặp để lan tỏa vòng sóng
            wakeUpLoop();
        };

        /**
         * Xử lý khi chuột rời khỏi nửa bên phải: tắt lực đẩy để lưới tự đàn hồi về vị trí ban đầu.
         */
        const handlePointerLeave = () => {
            // Đánh dấu chuột không còn trong vùng tương tác
            pointer.isActive = false;
            // Đảm bảo loop vẫn chạy nốt quá trình các nút đàn hồi về chỗ cũ rồi tự ngủ
            wakeUpLoop();
        };

        /**
         * Phản ứng khi người dùng thay đổi cài đặt prefers-reduced-motion ở mức hệ điều hành.
         */
        const handleReducedMotionChange = () => {
            // Nếu chuyển sang bật giảm chuyển động, hủy loop đang chạy và vẽ lại lưới tĩnh
            if (motionMediaQuery.matches && rafId !== null) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
            // Dựng lại lưới về vị trí gốc sạch sẽ
            rebuildGrid();
            drawFrame();
        };

        // Khởi tạo lưới ô ly và vẽ ngay khung hình đầu tiên lúc mount
        rebuildGrid();
        drawFrame();

        // Sử dụng ResizeObserver để cập nhật kích thước canvas khi viewport hoặc chiều cao form thay đổi
        const resizeObserver = new ResizeObserver(() => {
            rebuildGrid();
            drawFrame();
        });
        // Bắt đầu theo dõi kích thước của container bên phải
        resizeObserver.observe(containerEl);

        // Đăng ký các listener sự kiện chuột trực tiếp trên container nửa phải
        containerEl.addEventListener('pointermove', handlePointerMove);
        containerEl.addEventListener('pointerdown', handlePointerDown);
        containerEl.addEventListener('pointerleave', handlePointerLeave);
        // Lắng nghe thay đổi tùy chọn giảm chuyển động của trình duyệt
        motionMediaQuery.addEventListener('change', handleReducedMotionChange);

        // Hàm dọn dẹp toàn bộ listener, observer và animation frame khi component unmount
        return () => {
            // Hủy animation frame nếu còn đang chạy
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
            }
            // Ngắt theo dõi thay đổi kích thước container
            resizeObserver.disconnect();
            // Gỡ toàn bộ sự kiện con trỏ khỏi container
            containerEl.removeEventListener('pointermove', handlePointerMove);
            containerEl.removeEventListener('pointerdown', handlePointerDown);
            containerEl.removeEventListener('pointerleave', handlePointerLeave);
            // Gỡ lắng nghe thay đổi reduced-motion
            motionMediaQuery.removeEventListener('change', handleReducedMotionChange);
        };
    }, [containerRef]);

    // Trả về thẻ canvas phủ toàn bộ nửa phải, chặn sự kiện chuột trực tiếp để không cản thao tác nhập form
    return <canvas ref={canvasRef} className="auth-grid-canvas" aria-hidden="true" />;
};
