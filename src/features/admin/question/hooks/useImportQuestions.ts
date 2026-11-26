import { useCallback, useState } from 'react';
import { useToast } from '@/core/ui';
import { adminQuestionService } from '../services/adminQuestionService';
import type { QuestionImportResult } from '../types';
import { extractRequestErrorMessage, triggerBlobDownload } from '../utils/fileDownload';

const MAX_EXCEL_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Custom hook điều phối toàn bộ luồng Import câu hỏi hàng loạt từ Excel (UC A04 - Luồng 3a/3b).
 */
export function useImportQuestions(onImportSuccess: () => void, onCloseModal: () => void) {
    const toast = useToast();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState<boolean>(false);
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [isDownloadingReport, setIsDownloadingReport] = useState<boolean>(false);
    const [importResult, setImportResult] = useState<QuestionImportResult | null>(null);

    const handleReset = useCallback(() => {
        setSelectedFile(null);
        setFileError(null);
        setImportResult(null);
    }, []);

    const handleFileSelect = useCallback((file: File | null) => {
        setFileError(null);
        setImportResult(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const fileName = file.name.trim().toLowerCase();
        if (!fileName.endsWith('.xlsx')) {
            setSelectedFile(null);
            setFileError('Hệ thống chỉ hỗ trợ định dạng tệp Excel (.xlsx)');
            return;
        }

        if (file.size <= 0) {
            setSelectedFile(null);
            setFileError('Tệp Excel đang rỗng, vui lòng kiểm tra lại');
            return;
        }

        if (file.size > MAX_EXCEL_SIZE_BYTES) {
            setSelectedFile(null);
            setFileError('Dung lượng tệp Excel không được vượt quá 20 MB');
            return;
        }

        setSelectedFile(file);
    }, []);

    const handleDownloadTemplate = useCallback(async () => {
        if (isDownloadingTemplate) return;
        try {
            setIsDownloadingTemplate(true);
            const blob = await adminQuestionService.downloadImportTemplate();
            triggerBlobDownload(blob, 'mau-import-cau-hoi-leby.xlsx');
            toast.success('Đã tải xuống file Excel mẫu');
        } catch (err) {
            const msg = await extractRequestErrorMessage(err, 'Không thể tải xuống file Excel mẫu');
            toast.error(msg);
        } finally {
            setIsDownloadingTemplate(false);
        }
    }, [isDownloadingTemplate, toast]);

    const handleImport = useCallback(async () => {
        if (!selectedFile) {
            setFileError('Vui lòng chọn tệp Excel (.xlsx) trước khi tiến hành import');
            return;
        }
        if (isImporting) return;

        setIsImporting(true);
        setFileError(null);
        setImportResult(null);

        try {
            const res = await adminQuestionService.importFromExcel(selectedFile);
            if (!res.success || !res.data) {
                throw new Error(res.message || 'Import dữ liệu thất bại');
            }

            if (res.data.imported) {
                const { standaloneCount, groupCount, groupItemCount } = res.data;
                toast.success(
                    `Import thành công ${standaloneCount} câu đơn và ${groupCount} chùm (${groupItemCount} câu con)`
                );
                handleReset();
                onImportSuccess();
                onCloseModal();
            } else {
                setImportResult(res.data);
                toast.warning(`Phát hiện ${res.data.failCount} lỗi dữ liệu, vui lòng kiểm tra bảng bên dưới`);
            }
        } catch (err) {
            const msg = await extractRequestErrorMessage(err, 'Import câu hỏi thất bại, vui lòng thử lại');
            setFileError(msg);
        } finally {
            setIsImporting(false);
        }
    }, [selectedFile, isImporting, toast, handleReset, onImportSuccess, onCloseModal]);

    const handleDownloadErrorReport = useCallback(async () => {
        if (!importResult || importResult.errors.length === 0 || isDownloadingReport) return;
        try {
            setIsDownloadingReport(true);
            const blob = await adminQuestionService.downloadErrorReport(importResult.errors);
            const todayIso = new Date().toISOString().slice(0, 10);
            triggerBlobDownload(blob, `bao-cao-loi-import-cau-hoi-${todayIso}.xlsx`);
            toast.success('Đã tải báo cáo lỗi (.xlsx)');
        } catch (err) {
            const msg = await extractRequestErrorMessage(err, 'Không thể xuất báo cáo lỗi');
            toast.error(msg);
        } finally {
            setIsDownloadingReport(false);
        }
    }, [importResult, isDownloadingReport, toast]);

    return {
        selectedFile,
        fileError,
        isDownloadingTemplate,
        isImporting,
        isDownloadingReport,
        importResult,
        handleFileSelect,
        handleDownloadTemplate,
        handleImport,
        handleDownloadErrorReport,
        handleReset,
    };
}
