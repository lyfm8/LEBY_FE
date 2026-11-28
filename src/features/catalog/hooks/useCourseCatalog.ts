import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { catalogService } from '../services/catalogService';
import type { ModuleStatus } from '@/features/roadmap/types/roadmapTypes';
import type {
    CatalogPartGroup,
    CatalogScopeFilter,
    CatalogSectionFilter,
    CourseCatalogData,
} from '../types/catalogTypes';

// Kiểu bộ lọc trạng thái học tập tương đồng trang Lộ trình (?status=...)
export type CatalogStatusFilter = 'ALL' | ModuleStatus;

// Kiểu cấu trúc lỗi JSON chuẩn trả về từ máy chủ Backend
interface BackendErrorResponse {
    message?: string;
}

/**
 * Chuẩn hóa giá trị bộ lọc kỹ năng đọc từ URL, fallback an toàn về 'ALL' nếu tham số không hợp lệ.
 *
 * @param rawValue Giá trị thô đọc từ tham số ?section= trên thanh địa chỉ
 * @returns Giá trị bộ lọc kỹ năng hợp lệ
 */
function parseSectionFilter(rawValue: string | null): CatalogSectionFilter {
    // Chỉ chấp nhận 2 giá trị hợp lệ LISTENING hoặc READING
    if (rawValue === 'LISTENING' || rawValue === 'READING') {
        return rawValue;
    }
    // Mọi giá trị khác đều quay về hiển thị tất cả kỹ năng
    return 'ALL';
}

/**
 * Chuẩn hóa giá trị bộ lọc phạm vi học đọc từ URL, fallback an toàn về 'ALL'.
 *
 * @param rawValue Giá trị thô đọc từ tham số ?scope= trên thanh địa chỉ
 * @returns Giá trị bộ lọc phạm vi học hợp lệ
 */
function parseScopeFilter(rawValue: string | null): CatalogScopeFilter {
    // Chỉ chấp nhận ROADMAP (Trọng tâm cần học) hoặc FREE_STUDY (Học tự do)
    if (rawValue === 'ROADMAP' || rawValue === 'FREE_STUDY') {
        return rawValue;
    }
    // Mặc định hiển thị toàn bộ mô-đun
    return 'ALL';
}

/**
 * Chuẩn hóa giá trị bộ lọc trạng thái mô-đun đọc từ URL (?status=...).
 *
 * @param rawValue Giá trị trạng thái thô trên thanh địa chỉ
 * @returns Giá trị bộ lọc trạng thái hợp lệ
 */
function parseStatusFilter(rawValue: string | null): CatalogStatusFilter {
    // Chỉ chấp nhận các trạng thái học tập hợp lệ khớp với trang Lộ trình
    if (
        rawValue === 'COMPLETED' ||
        rawValue === 'IN_PROGRESS' ||
        rawValue === 'UNLOCKED' ||
        rawValue === 'LOCKED'
    ) {
        return rawValue;
    }
    // Mặc định hiển thị tất cả trạng thái
    return 'ALL';
}

/**
 * Chuẩn hóa bộ lọc mã phần thi đọc từ URL (?part=...).
 *
 * @param rawValue Chuỗi mã partId thô từ URL
 * @returns Số nguyên dương partId hoặc null nếu đang xem tất cả 7 phần thi
 */
function parsePartFilter(rawValue: string | null): number | null {
    // Bỏ qua nếu không có tham số hoặc không phải chuỗi chữ số nguyên dương
    if (!rawValue || !/^\d+$/.test(rawValue)) {
        return null;
    }
    // Chuyển sang kiểu số nguyên
    const parsed = Number(rawValue);
    // Chỉ nhận số nguyên lớn hơn 0
    return parsed > 0 ? parsed : null;
}

/**
 * Trích xuất thông điệp lỗi thân thiện từ ngoại lệ khi gọi API Thư viện khóa học.
 *
 * @param err Ngoại lệ bắt được trong khối catch
 * @returns Chuỗi thông báo lỗi dễ hiểu để hiển thị cho học viên
 */
function extractCatalogErrorMessage(err: unknown): string {
    // Kiểm tra xem ngoại lệ có phải lỗi phản hồi từ Axios hay không
    if (axios.isAxiosError<BackendErrorResponse>(err)) {
        // Ưu tiên thông điệp nghiệp vụ mà Backend đã định dạng sẵn
        const serverMessage = err.response?.data?.message;
        if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
            return serverMessage;
        }
    }
    // Thông báo dự phòng khi mất kết nối mạng hoặc máy chủ tạm gián đoạn
    return 'Không thể kết nối máy chủ để tải thư viện khóa học. Vui lòng thử lại.';
}

/**
 * Custom Hook quản lý toàn bộ trạng thái dữ liệu, bộ lọc đa tiêu chí đồng bộ URL
 * và tìm kiếm tức thì cho màn hình Thư viện khóa học 7 Part TOEIC.
 *
 * @returns Dữ liệu thư viện gốc, danh sách phần thi đã lọc, trạng thái tải/lỗi và các hàm điều khiển bộ lọc
 */
export function useCourseCatalog() {
    // Lưu dữ liệu tổng thể Thư viện khóa học nhận từ Backend
    const [data, setData] = useState<CourseCatalogData | null>(null);
    // Cờ báo trạng thái đang nạp dữ liệu từ máy chủ
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Lưu thông báo lỗi nếu quá trình tải thất bại
    const [error, setError] = useState<string | null>(null);
    // Đồng bộ bộ lọc kỹ năng, phần thi, phạm vi và từ khóa tìm kiếm trực tiếp lên URL Search Params
    const [searchParams, setSearchParams] = useSearchParams();

    // Đọc giá trị bộ lọc kỹ năng hiện tại từ URL
    const sectionFilter = parseSectionFilter(searchParams.get('section'));
    // Đọc giá trị bộ lọc phần thi hiện tại từ URL
    const selectedPartId = parsePartFilter(searchParams.get('part'));
    // Đọc giá trị bộ lọc phạm vi học hiện tại từ URL
    const scopeFilter = parseScopeFilter(searchParams.get('scope'));
    // Đọc giá trị bộ lọc trạng thái hiện tại từ URL
    const statusFilter = parseStatusFilter(searchParams.get('status'));
    // Đọc từ khóa tìm kiếm hiện tại từ URL (mặc định chuỗi rỗng)
    const searchQuery = searchParams.get('q') ?? '';

    // Hàm gọi API nạp toàn bộ Thư viện khóa học 7 Part
    const fetchCatalog = useCallback(async () => {
        // Bật trạng thái đang tải và xóa thông báo lỗi cũ trước khi gọi lại
        setIsLoading(true);
        setError(null);
        try {
            // Gọi API Backend lấy dữ liệu thư viện 7 Part kèm đối chiếu lộ trình
            const response = await catalogService.getCourseCatalog();
            // Nếu phản hồi thành công và có payload hợp lệ -> cập nhật state
            if (response.success && response.data) {
                setData(response.data);
            } else {
                // Ghi nhận thông báo lỗi nếu API trả trạng thái không thành công
                setData(null);
                setError(response.message || 'Không thể tải danh mục thư viện khóa học.');
            }
        } catch (err: unknown) {
            // Bóc tách thông điệp lỗi thân thiện để hiển thị cho học viên
            setData(null);
            setError(extractCatalogErrorMessage(err));
        } finally {
            // Tắt trạng thái đang tải dù thành công hay gặp lỗi
            setIsLoading(false);
        }
    }, []);

    // Tự động nạp dữ liệu thư viện ngay khi người dùng mở trang lần đầu
    useEffect(() => {
        void fetchCatalog();
    }, [fetchCatalog]);

    // Cập nhật bộ lọc kỹ năng lên URL (xóa bộ lọc part cũ nếu không thuộc kỹ năng mới chọn)
    const setSectionFilter = useCallback(
        (nextSection: CatalogSectionFilter) => {
            setSearchParams((prev) => {
                // Nhân bản URLSearchParams để không chỉnh sửa trực tiếp tham chiếu cũ
                const next = new URLSearchParams(prev);
                if (nextSection === 'ALL') {
                    next.delete('section');
                } else {
                    next.set('section', nextSection);
                }
                // Xóa chọn Part cụ thể để tránh tình trạng lọc chéo (ví dụ chọn Reading nhưng vẫn giữ Part 1)
                next.delete('part');
                return next;
            });
        },
        [setSearchParams],
    );

    // Cập nhật phần thi đang chọn (Part 1 - Part 7 hoặc null để xem toàn bộ)
    const setSelectedPartId = useCallback(
        (nextPartId: number | null) => {
            setSearchParams((prev) => {
                // Tạo bản sao tham số URL mới
                const next = new URLSearchParams(prev);
                if (nextPartId === null) {
                    next.delete('part');
                } else {
                    next.set('part', String(nextPartId));
                }
                return next;
            });
        },
        [setSearchParams],
    );

    // Cập nhật bộ lọc phạm vi học (Tất cả / Trọng tâm cần học / Học tự do)
    const setScopeFilter = useCallback(
        (nextScope: CatalogScopeFilter) => {
            setSearchParams((prev) => {
                // Tạo bản sao tham số URL mới
                const next = new URLSearchParams(prev);
                if (nextScope === 'ALL') {
                    next.delete('scope');
                } else {
                    next.set('scope', nextScope);
                }
                return next;
            });
        },
        [setSearchParams],
    );

    // Cập nhật bộ lọc trạng thái mô-đun (Tất cả / Đang học / Đã hoàn thành / Chưa mở khóa)
    const setStatusFilter = useCallback(
        (nextStatus: CatalogStatusFilter) => {
            setSearchParams((prev) => {
                // Tạo bản sao tham số URL mới
                const next = new URLSearchParams(prev);
                if (nextStatus === 'ALL') {
                    next.delete('status');
                } else {
                    next.set('status', nextStatus);
                }
                return next;
            });
        },
        [setSearchParams],
    );

    // Cập nhật từ khóa tìm kiếm mô-đun / kỹ năng lên URL (dùng replace để không làm rối lịch sử nút Back)
    const setSearchQuery = useCallback(
        (nextQuery: string) => {
            setSearchParams(
                (prev) => {
                    // Tạo bản sao tham số URL mới
                    const next = new URLSearchParams(prev);
                    if (nextQuery.trim().length === 0) {
                        next.delete('q');
                    } else {
                        next.set('q', nextQuery);
                    }
                    return next;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    // Đặt lại toàn bộ bộ lọc và ô tìm kiếm về trạng thái mặc định ban đầu
    const resetFilters = useCallback(() => {
        setSearchParams({});
    }, [setSearchParams]);

    // Danh sách Part khả dụng trên thanh chọn nhanh 7 Part (lọc theo kỹ năng đang chọn)
    const availablePartsForTabs = useMemo<CatalogPartGroup[]>(() => {
        // Nếu chưa có dữ liệu thì trả về mảng rỗng
        if (!data?.parts) {
            return [];
        }
        // Nếu đang xem tất cả kỹ năng thì giữ đủ 7 Part
        if (sectionFilter === 'ALL') {
            return data.parts;
        }
        // Ngược lại chỉ hiển thị các Part thuộc kỹ năng Nghe hiểu hoặc Đọc hiểu đang chọn
        return data.parts.filter((part) => part.section === sectionFilter);
    }, [data, sectionFilter]);

    // Tối ưu: Chỉ tính toán lại danh sách Part & Module khớp bộ lọc khi dữ liệu hoặc tiêu chí thay đổi
    const filteredParts = useMemo<CatalogPartGroup[]>(() => {
        // Trả về mảng rỗng nếu chưa tải xong dữ liệu
        if (!data?.parts) {
            return [];
        }

        // Chuẩn hóa từ khóa tìm kiếm sang chữ thường để đối khớp không phân biệt hoa thường
        const normalizedKeyword = searchQuery.trim().toLowerCase();
        // Kiểm tra xem người dùng có đang thu hẹp danh sách bằng phạm vi học, trạng thái hay từ khóa không
        const hasNarrowModuleFilter =
            scopeFilter !== 'ALL' || statusFilter !== 'ALL' || normalizedKeyword.length > 0;

        // Lọc theo từng Part và từng Module trực thuộc
        const matchedGroups: CatalogPartGroup[] = [];
        for (const part of data.parts) {
            // Bỏ qua Part nếu không khớp kỹ năng đang chọn
            if (sectionFilter !== 'ALL' && part.section !== sectionFilter) {
                continue;
            }
            // Bỏ qua Part nếu người dùng đang chọn đích danh 1 Part khác
            if (selectedPartId !== null && part.partId !== selectedPartId) {
                continue;
            }

            // Lọc danh sách mô-đun bên trong Part theo phạm vi học, trạng thái và từ khóa tìm kiếm
            const matchedModules = part.modules.filter((mod) => {
                // Kiểm tra bộ lọc phạm vi và trạng thái (chỉ áp dụng khi học viên đã có lộ trình)
                if (data.hasLearningPath) {
                    if (scopeFilter === 'ROADMAP' && !mod.inRoadmap) {
                        return false;
                    }
                    if (scopeFilter === 'FREE_STUDY' && mod.accessMode !== 'FREE_STUDY') {
                        return false;
                    }
                    if (statusFilter !== 'ALL') {
                        // Coi trạng thái Đang học bao gồm cả IN_PROGRESS và UNLOCKED cho trải nghiệm tự nhiên
                        if (statusFilter === 'IN_PROGRESS') {
                            if (mod.status !== 'IN_PROGRESS' && mod.status !== 'UNLOCKED') {
                                return false;
                            }
                        } else if (mod.status !== statusFilter) {
                            return false;
                        }
                    }
                }

                // Kiểm tra khớp từ khóa trên tiêu đề mô-đun, mô tả, tên phần thi, năng lực hoặc tên bài học
                if (normalizedKeyword.length > 0) {
                    const inTitle = mod.title.toLowerCase().includes(normalizedKeyword);
                    const inDesc = mod.description.toLowerCase().includes(normalizedKeyword);
                    const inPartName = mod.partName.toLowerCase().includes(normalizedKeyword);
                    const inAbility = mod.abilities.some((ab) => ab.toLowerCase().includes(normalizedKeyword));
                    const inLesson = mod.lessonPreviews.some((ls) =>
                        ls.title.toLowerCase().includes(normalizedKeyword),
                    );
                    if (!inTitle && !inDesc && !inPartName && !inAbility && !inLesson) {
                        return false;
                    }
                }

                return true;
            });

            // Khi đang tìm kiếm hoặc lọc phạm vi -> ẩn các Part không còn mô-đun nào khớp để giao diện gọn gàng
            if (hasNarrowModuleFilter && matchedModules.length === 0) {
                continue;
            }

            // Giữ lại nhóm Part với danh sách mô-đun đã lọc
            matchedGroups.push({
                ...part,
                modules: matchedModules,
            });
        }

        return matchedGroups;
    }, [data, sectionFilter, selectedPartId, scopeFilter, statusFilter, searchQuery]);

    // Tính tổng số mô-đun đang hiển thị sau khi áp dụng toàn bộ bộ lọc
    const matchedModulesCount = useMemo<number>(() => {
        return filteredParts.reduce((total, group) => total + group.modules.length, 0);
    }, [filteredParts]);

    // Xác định người dùng có đang bật ít nhất 1 bộ lọc hay từ khóa tìm kiếm nào hay không
    const isFiltering =
        sectionFilter !== 'ALL' ||
        selectedPartId !== null ||
        scopeFilter !== 'ALL' ||
        statusFilter !== 'ALL' ||
        searchQuery.trim().length > 0;

    // Trả về đầy đủ dữ liệu và hành động cho CourseCatalogPage
    return {
        data,
        isLoading,
        error,
        refetch: fetchCatalog,
        sectionFilter,
        selectedPartId,
        scopeFilter,
        statusFilter,
        searchQuery,
        isFiltering,
        availablePartsForTabs,
        filteredParts,
        matchedModulesCount,
        setSectionFilter,
        setSelectedPartId,
        setScopeFilter,
        setStatusFilter,
        setSearchQuery,
        resetFilters,
    };
}
