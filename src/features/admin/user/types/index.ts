/**
 * @file Định nghĩa các kiểu dữ liệu TypeScript cho phân hệ Quản lý tài khoản người dùng (UC A02).
 * Khớp 100% với hợp đồng DTO trả về từ AdminUserController bên Backend.
 */

// Vai trò người dùng được hệ thống hỗ trợ (khớp Enum ERole bên Backend)
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

// Trạng thái hoạt động của tài khoản (đang hoạt động hoặc bị tạm khóa)
export type UserAccountStatus = 'ACTIVE' | 'INACTIVE';

// Loại đối tượng người học (khớp Enum ELearnerType bên Backend)
export type LearnerType =
  | 'PRIMARY_STUDENT'
  | 'SECONDARY_STUDENT'
  | 'HIGH_SCHOOL_STUDENT'
  | 'UNIVERSITY_STUDENT'
  | 'WORKING'
  | 'OTHER';

// Các tab trong trang chi tiết tài khoản người dùng
export type UserDetailTab = 'learning-path' | 'diagnostic' | 'module-test' | 'mock-test';

// Bộ lọc danh sách người dùng đồng bộ với query param Backend và URL Search Params
export interface UserFilterParams {
  // Số trang hiện tại (bắt đầu từ 0)
  page: number;
  // Số dòng trên mỗi trang
  size: number;
  // Từ khóa tìm kiếm theo tên hoặc email
  keyword?: string;
  // Lọc theo trạng thái kích hoạt (true: hoạt động, false: bị khóa)
  isActive?: boolean;
  // Lọc theo vai trò
  role?: UserRole;
  // Lọc theo mốc điểm mục tiêu AIM (450, 550, 650, ...)
  aimScore?: number;
}

// Dữ liệu tóm tắt một người dùng hiển thị ở bảng danh sách và phần header trang chi tiết
export interface UserListItemResponse {
  // Mã người dùng
  id: number;
  // Địa chỉ email đăng nhập
  email: string;
  // Họ và tên hiển thị
  fullName: string | null;
  // Vai trò hiện tại
  role: UserRole;
  // Chuỗi trạng thái hiển thị ('ACTIVE' | 'INACTIVE')
  status: UserAccountStatus;
  // Cờ boolean trạng thái hoạt động
  isActive: boolean;
  // ID mục tiêu điểm AIM hiện tại (nếu có)
  targetProfileId: number | null;
  // Mốc điểm AIM dạng số (VD: 650)
  aimScore: number | null;
  // Nhãn AIM định dạng sẵn từ Backend (VD: "AIM 650")
  aimTarget: string | null;
  // Đối tượng người học
  learnerType: LearnerType | null;
  // Ngày sinh (ISO YYYY-MM-DD)
  dob: string | null;
  // URL ảnh đại diện
  avatar: string | null;
  // Thời điểm đăng ký tài khoản
  createdAt: string;
}

// Trạng thái phiên thi trực tuyến đang diễn ra (phục vụ cảnh báo ngoại lệ 7d)
export interface UserActiveExamStatusResponse {
  // Có đang làm bài thi bất kỳ nào không
  hasActiveExamSession: boolean;
  // Có đang làm bài chẩn đoán / thi thử chưa nộp không
  hasActiveDiagnostic: boolean;
  // Có đang làm bài vượt ải mô-đun chưa nộp không
  hasActiveModuleTest: boolean;
}

// Một dòng lịch sử làm bài thi chẩn đoán đầu vào
export interface AdminUserDiagnosticHistoryItem {
  // ID lượt làm bài
  attemptId: number;
  // Tên đề thi chẩn đoán
  testTitle: string;
  // Mốc AIM gắn với lượt thi này
  targetScore: number | null;
  // Trạng thái lượt thi (IN_PROGRESS, SUBMITTED, TIMED_OUT, ABANDONED)
  status: string;
  // Thời điểm bắt đầu làm bài
  startedAt: string | null;
  // Thời điểm nộp bài
  completedAt: string | null;
  // Thời gian làm bài thực tế tính bằng giây
  durationSeconds: number | null;
  // Số câu trả lời đúng
  correctAnswers: number | null;
  // Tổng số câu hỏi của đề
  totalQuestions: number | null;
  // Điểm TOEIC dự đoán quy đổi thang 990
  predictedScore: number | null;
}

// Một chặng mô-đun trong lộ trình học của học viên
export interface AdminUserLearningPathItem {
  // ID item trong lộ trình
  id: number;
  // Thứ tự chặng học
  orderNo: number;
  // ID mô-đun học tập
  moduleId: number | null;
  // Tên mô-đun
  moduleTitle: string;
  // Mô tả ngắn mô-đun
  moduleDescription: string | null;
  // Tên Part (VD: "Part 5")
  partName: string | null;
  // Nhóm kỹ năng ('LISTENING' | 'READING' | null)
  section: string | null;
  // Tên năng lực yếu tương ứng nếu có
  abilityName: string | null;
  // Lý do đưa vào lộ trình
  reason: string | null;
  // Trạng thái chặng học (COMPLETED, IN_PROGRESS, UNLOCKED, LOCKED)
  status: string | null;
  // Nhãn tiếng Việt của trạng thái
  statusLabel: string;
  // Tổng số bài học của mô-đun
  totalLessons: number;
  // Số bài học đã hoàn thành ước tính theo progressPercent
  completedLessons: number;
  // Phần trăm hoàn thành bài học (0 - 100)
  progressPercent: number;
  // Kết quả vượt ải mô-đun
  isCorrect: boolean | null;
}

// Dữ liệu tổng quan lộ trình học hiện tại của học viên
export interface AdminUserLearningPathResponse {
  // ID lộ trình học
  learningPathId: number;
  // Phiên bản lộ trình
  version: number | null;
  // Trạng thái lộ trình (ACTIVE, COMPLETED, ARCHIVED)
  status: string;
  // Mục tiêu AIM của lộ trình
  targetScore: number | null;
  // Phần trăm hoàn thành tổng lộ trình
  progressPercent: number;
  // Tổng số mô-đun trong lộ trình
  totalModules: number;
  // Số mô-đun đã hoàn thành
  completedModules: number;
  // Ngày khởi tạo lộ trình
  createdAt: string | null;
  // Danh sách các chặng học tuần tự
  items: AdminUserLearningPathItem[];
}

// Một dòng lịch sử thi vượt ải mô-đun
export interface AdminUserModuleTestHistoryItem {
  // ID lượt thi vượt ải
  attemptId: number;
  // ID mô-đun
  moduleId: number | null;
  // Tên mô-đun
  moduleTitle: string;
  // Tên phần thi Part
  partName: string | null;
  // Điểm đạt được (thang 100)
  score: number | null;
  // Điểm chuẩn cần đạt theo AIM của học viên
  passScore: number | null;
  // Kết quả ('PASS' | 'FAIL' | null)
  result: string | null;
  // Đã nộp bài hay chưa
  isSubmitted: boolean;
  // Thời điểm nộp bài hoặc tạo lượt thi
  submittedAt: string | null;
}

// Một dòng kết quả bài thi thử 200 câu (FULL_MOCK_TEST) đã hoàn thành
export interface AdminUserMockTestHistoryItem {
  // ID lượt thi thử
  attemptId: number;
  // Tên đề thi thử
  testTitle: string;
  // Thời điểm hoàn thành bài thi
  completedAt: string | null;
  // Thời gian làm bài tính bằng giây
  durationSeconds: number | null;
  // Số câu đúng phần Nghe
  listeningCorrect: number;
  // Tổng số câu phần Nghe
  listeningTotal: number;
  // Điểm quy đổi phần Nghe (tối đa 495)
  listeningScore: number;
  // Số câu đúng phần Đọc
  readingCorrect: number;
  // Tổng số câu phần Đọc
  readingTotal: number;
  // Điểm quy đổi phần Đọc (tối đa 495)
  readingScore: number;
  // Tổng điểm TOEIC (Listening + Reading, tối đa 990)
  totalScore: number;
}

// Dữ liệu chi tiết đầy đủ cho trang /admin/users/:id
export interface AdminUserDetailResponse {
  // Thông tin hồ sơ người dùng
  profile: UserListItemResponse;
  // Trạng thái có đang làm bài thi trực tuyến không
  activeExamStatus: UserActiveExamStatusResponse;
  // Lịch sử bài thi chẩn đoán đầu vào
  diagnosticHistory: AdminUserDiagnosticHistoryItem[];
  // Lộ trình học tập hiện tại (null nếu học viên chưa có lộ trình)
  learningPath: AdminUserLearningPathResponse | null;
  // Lịch sử thi vượt ải các mô-đun
  moduleTestHistory: AdminUserModuleTestHistoryItem[];
  // Lịch sử điểm thi thử 200 câu
  mockTestHistory: AdminUserMockTestHistoryItem[];
}

// Mốc mục tiêu AIM nạp từ /api/admin/target-profiles để đổ vào dropdown lọc
export interface TargetProfileOption {
  // ID mục tiêu
  id: number;
  // Mốc điểm TOEIC trả về từ TargetProfileResponse (450, 550, 650, ...)
  aimScore: number;
  // Mô tả mốc điểm
  description?: string;
}

// Request cập nhật vai trò người dùng (chỉ nâng/hạ qua lại STUDENT <-> TEACHER)
export interface UpdateUserRoleRequest {
  // Vai trò mới
  role: 'STUDENT' | 'TEACHER';
}
