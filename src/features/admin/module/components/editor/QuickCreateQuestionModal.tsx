import React, { useMemo, useEffect, useState, useRef } from 'react';
import type { AbilityResponse } from '@/features/admin/part/types';
import type { SavedMedia } from '@/features/media/types';
import { useMediaUpload } from '@/features/media/hooks/useMediaUpload';
import type {
  PracticeQuestionResponse,
  QuickCreateQuestionGroupPayload,
  QuickCreateQuestionPayload,
  SectionType,
} from '../../types';
import { adminModuleService } from '../../services/adminModuleService';
import { X, Loader2, Sparkles, Lock, Plus, Trash2, Upload, Image as ImageIcon, Music, RefreshCw } from 'lucide-react';
import { useToast } from '@/core/ui';

/**
 * Điểm số mặc định gán cho mỗi câu hỏi khi mới tạo nhanh.
 */
const DEFAULT_PRACTICE_POINTS = 10;

/**
 * Giới hạn số câu con hợp lệ cho một chùm câu hỏi (khớp quy chuẩn Backend 2 - 5 câu).
 */
const MIN_GROUP_ITEMS = 2;
const MAX_GROUP_ITEMS = 5;

/**
 * Kiểu dữ liệu nội bộ cho từng câu hỏi con khi soạn chùm câu hỏi.
 */
interface GroupSubItemDraft {
  // Khóa định danh tạm trên UI để React theo dõi danh sách ổn định
  keyId: number;
  // Tên gợi nhớ của câu con
  name: string;
  // Nội dung đề bài câu con
  text: string;
  // 4 phương án A, B, C, D
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  // Đáp án đúng A, B, C hoặc D
  correctKey: 'A' | 'B' | 'C' | 'D';
  // Độ khó (1 - 5)
  difficulty: number;
  // Danh sách ID năng lực gắn cho câu con
  abilityIds: number[];
  // Giải thích chi tiết (tùy chọn)
  analysis: string;
}

/**
 * Props đầu vào cho Modal tạo nhanh câu hỏi trực tiếp từ bài học.
 */
interface QuickCreateQuestionModalProps {
  // Cờ bật/tắt Modal
  isOpen: boolean;
  // Hàm đóng Modal
  onClose: () => void;
  // ID Part cố định của Module hiện tại
  partId?: number | null;
  // Tên Part cố định hiển thị ở dạng chỉ đọc
  partName?: string | null;
  // Phân khu LISTENING / READING của Part hiện tại
  section?: SectionType | null;
  // ID Ability mặc định của bài học hiện tại (nếu có)
  defaultAbilityId?: number | null;
  // Danh sách Ability đã được lọc chặt theo phạm vi Module hiện tại
  scopedAbilities: AbilityResponse[];
  // Callback trả danh sách câu hỏi mới tạo (1 câu đơn hoặc 2-5 câu con của chùm) về bài học
  onCreatedAndAttach: (newQuestions: PracticeQuestionResponse[]) => void;
}

/**
 * Xác định Part hiện tại có phải dạng chùm câu hỏi (Part 3, 4, 6, 7) hay không.
 */
const isGroupPart = (partId?: number | null, partName?: string | null): boolean => {
  // Kiểm tra nhanh theo tên Part trước để chính xác kể cả khi ID khác nhau giữa các môi trường
  if (partName) {
    const match = partName.match(/Part\s*([1-7])/i);
    if (match) {
      const num = Number(match[1]);
      return num === 3 || num === 4 || num === 6 || num === 7;
    }
  }
  // Dự phòng kiểm tra theo ID chuẩn (3, 4, 6, 7)
  return partId === 3 || partId === 4 || partId === 6 || partId === 7;
};

/**
 * Xác định Part hiện tại có phải Part 2 (chỉ có 3 phương án A, B, C) hay không.
 */
const isPartTwo = (partId?: number | null, partName?: string | null): boolean => {
  if (partName && /Part\s*2\b/i.test(partName)) return true;
  return partId === 2;
};

/**
 * Tạo một bản nháp câu hỏi con rỗng kèm Ability mặc định.
 */
const createEmptySubItem = (keyId: number, defaultAbilityIds: number[]): GroupSubItemDraft => ({
  keyId,
  name: '',
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctKey: 'A',
  difficulty: 2,
  abilityIds: [...defaultAbilityIds],
  analysis: '',
});

/**
 * Modal tạo nhanh câu hỏi trực tiếp từ bài học.
 * - Khóa cố định Phần thi (Part) theo mô-đun hiện tại.
 * - Tự động hiển thị form Câu hỏi đơn (Part 1, 2, 5) hoặc Chùm câu hỏi (Part 3, 4, 6, 7).
 * - Chỉ hiển thị danh sách Năng lực (Ability) thuộc phạm vi mô-đun hiện tại.
 */
export const QuickCreateQuestionModal: React.FC<QuickCreateQuestionModalProps> = ({
  isOpen,
  onClose,
  partId,
  partName,
  section,
  defaultAbilityId,
  scopedAbilities,
  onCreatedAndAttach,
}) => {
  // Hook hiển thị thông báo Toast
  const toast = useToast();
  // Hook upload tệp Ảnh / Audio trực tiếp lên Cloudinary trả về SavedMedia (chứa mediaId)
  const { uploadSingle, isUploading: isUploadingMedia } = useMediaUpload();
  // Ref trỏ tới ô input file ẩn cho nút tải lên media mới
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  // Ref trỏ tới ô input file ẩn cho nút thay thế (sửa) một media đã tải lên
  const replaceMediaInputRef = useRef<HTMLInputElement | null>(null);
  // Lưu ID của media đang được bấm nút "Thay tệp"
  const [replacingMediaId, setReplacingMediaId] = useState<number | null>(null);
  // Danh sách các tệp Media (Ảnh / Audio) đã upload để đính kèm vào câu hỏi / chùm câu hỏi
  const [uploadedMedias, setUploadedMedias] = useState<SavedMedia[]>([]);
  // Thông báo lỗi cụ thể nếu quá trình upload media thất bại
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null);
  // Cờ theo dõi trạng thái mở trước đó để chỉ reset form đúng 1 lần khi Modal chuyển từ đóng -> mở
  const wasOpenRef = useRef<boolean>(false);
  // Cờ đang gửi yêu cầu tạo câu hỏi lên máy chủ
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Thông báo lỗi validate hiển thị trực tiếp trên form
  const [formError, setFormError] = useState<string | null>(null);

  // Xác định chế độ form dựa trên Part cố định của mô-đun
  const isGroupMode = useMemo(() => isGroupPart(partId, partName), [partId, partName]);
  const isThreeOptionPart = useMemo(() => isPartTwo(partId, partName), [partId, partName]);

  // Tính danh sách Ability chọn sẵn mặc định (ưu tiên Ability của bài học, nếu mô-đun chỉ có 1 Ability thì chọn luôn)
  const initialAbilityIds = useMemo(() => {
    if (defaultAbilityId && scopedAbilities.some((ab) => ab.id === defaultAbilityId)) {
      return [defaultAbilityId];
    }
    if (scopedAbilities.length === 1) {
      return [scopedAbilities[0].id];
    }
    return [];
  }, [defaultAbilityId, scopedAbilities]);

  // ===== STATE CHO CHẾ ĐỘ CÂU HỎI ĐƠN (Part 1, 2, 5) =====
  const [singleName, setSingleName] = useState<string>('');
  const [singleDifficulty, setSingleDifficulty] = useState<number>(2);
  const [singleAbilityIds, setSingleAbilityIds] = useState<number[]>([]);
  const [singleText, setSingleText] = useState<string>('');
  const [singleOptA, setSingleOptA] = useState<string>('');
  const [singleOptB, setSingleOptB] = useState<string>('');
  const [singleOptC, setSingleOptC] = useState<string>('');
  const [singleOptD, setSingleOptD] = useState<string>('');
  const [singleCorrectKey, setSingleCorrectKey] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [singleTranscript, setSingleTranscript] = useState<string>('');
  const [singleAnalysis, setSingleAnalysis] = useState<string>('');

  // ===== STATE CHO CHẾ ĐỘ CHÙM CÂU HỎI (Part 3, 4, 6, 7) =====
  const [groupName, setGroupName] = useState<string>('');
  const [groupInstruction, setGroupInstruction] = useState<string>('');
  const [groupContext, setGroupContext] = useState<string>('');
  const [groupTranslation, setGroupTranslation] = useState<string>('');
  const [groupItems, setGroupItems] = useState<GroupSubItemDraft[]>([]);

  // Reset toàn bộ form CHỈ KHI Modal chuyển từ đóng -> mở (tránh bị xóa nhầm file vừa upload khi component cha re-render)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setFormError(null);
      setMediaUploadError(null);
      setReplacingMediaId(null);
      setUploadedMedias([]);
      // Đặt lại state cho chế độ câu đơn
      setSingleName('');
      setSingleDifficulty(2);
      setSingleAbilityIds(initialAbilityIds);
      setSingleText('');
      setSingleOptA('');
      setSingleOptB('');
      setSingleOptC('');
      setSingleOptD('');
      setSingleCorrectKey('A');
      setSingleTranscript('');
      setSingleAnalysis('');
      // Đặt lại state cho chế độ chùm câu hỏi (khởi tạo sẵn 2 câu con tối thiểu)
      setGroupName('');
      setGroupInstruction('');
      setGroupContext('');
      setGroupTranslation('');
      setGroupItems([
        createEmptySubItem(1, initialAbilityIds),
        createEmptySubItem(2, initialAbilityIds),
      ]);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialAbilityIds]);

  // Không render ra DOM nếu Modal đang đóng
  if (!isOpen) return null;

  /**
   * Bật/tắt một Ability cho câu hỏi đơn.
   */
  const toggleSingleAbility = (abId: number) => {
    setSingleAbilityIds((prev) =>
      prev.includes(abId) ? prev.filter((id) => id !== abId) : [...prev, abId]
    );
  };

  /**
   * Cập nhật một trường bất kỳ của câu con tại vị trí index trong chế độ chùm.
   */
  const updateSubItem = <K extends keyof GroupSubItemDraft>(
    index: number,
    field: K,
    value: GroupSubItemDraft[K]
  ) => {
    setGroupItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  /**
   * Bật/tắt một Ability cho câu con tại vị trí index.
   */
  const toggleSubItemAbility = (index: number, abId: number) => {
    setGroupItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const nextIds = item.abilityIds.includes(abId)
          ? item.abilityIds.filter((id) => id !== abId)
          : [...item.abilityIds, abId];
        return { ...item, abilityIds: nextIds };
      })
    );
  };

  /**
   * Thêm một câu hỏi con mới vào chùm (tối đa 5 câu con).
   */
  const handleAddSubItem = () => {
    if (groupItems.length >= MAX_GROUP_ITEMS) return;
    const nextKey = Date.now();
    setGroupItems((prev) => [...prev, createEmptySubItem(nextKey, initialAbilityIds)]);
  };

  /**
   * Xóa một câu hỏi con khỏi chùm (giữ tối thiểu 2 câu con).
   */
  const handleRemoveSubItem = (index: number) => {
    if (groupItems.length <= MIN_GROUP_ITEMS) return;
    setGroupItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  /**
   * Xử lý tải lên tệp Ảnh hoặc Audio trực tiếp lên Cloudinary để đính kèm vào câu hỏi.
   */
  const handleUploadMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset giá trị input để có thể chọn lại cùng file nếu cần
    e.target.value = '';
    if (!file) return;

    setMediaUploadError(null);
    try {
      const saved = await uploadSingle(file);
      // Gắn thêm tên gốc nếu Cloudinary không trả về
      const normalized: SavedMedia = {
        ...saved,
        originalFilename: saved.originalFilename || file.name,
      };
      setUploadedMedias((prev) => [...prev, normalized]);
      toast.success('Đã tải tệp media lên thành công!');
    } catch (error: unknown) {
      const detail =
        error instanceof Error ? error.message : 'Tải tệp media thất bại. Vui lòng thử lại!';
      setMediaUploadError(detail);
      toast.error(detail);
    }
  };

  /**
   * Kích hoạt chọn tệp mới để thay thế (sửa) một media đã tải lên.
   */
  const handleTriggerReplaceMedia = (mediaId: number) => {
    setReplacingMediaId(mediaId);
    replaceMediaInputRef.current?.click();
  };

  /**
   * Xử lý upload tệp mới thay thế đúng vị trí của media cũ trong danh sách.
   */
  const handleReplaceMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || replacingMediaId === null) return;

    const targetId = replacingMediaId;
    setMediaUploadError(null);
    try {
      const saved = await uploadSingle(file);
      const normalized: SavedMedia = {
        ...saved,
        originalFilename: saved.originalFilename || file.name,
      };
      setUploadedMedias((prev) => prev.map((item) => (item.id === targetId ? normalized : item)));
      toast.success('Đã thay thế tệp media thành công!');
    } catch (error: unknown) {
      const detail =
        error instanceof Error ? error.message : 'Thay thế tệp media thất bại. Vui lòng thử lại!';
      setMediaUploadError(detail);
      toast.error(detail);
    } finally {
      setReplacingMediaId(null);
    }
  };

  /**
   * Gỡ một tệp Media khỏi danh sách đính kèm của câu hỏi đang soạn.
   */
  const handleRemoveUploadedMedia = (mediaId: number) => {
    setUploadedMedias((prev) => prev.filter((item) => item.id !== mediaId));
  };

  /**
   * Trích xuất thông báo lỗi từ response Axios.
   */
  const extractApiError = (error: unknown, fallback: string): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const resp = (error as { response?: { data?: { message?: string } } }).response;
      if (resp?.data?.message) return resp.data.message;
    }
    return fallback;
  };

  /**
   * Xử lý submit cho cả 2 chế độ: Câu hỏi đơn và Chùm câu hỏi.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Chặn nếu mô-đun chưa được gắn Phần thi (Part)
    if (!partId) {
      setFormError('Mô-đun hiện tại chưa được gán Phần thi (Part). Vui lòng cấu hình Part cho mô-đun trước.');
      return;
    }

    // Luồng 1: Tạo nhanh Chùm câu hỏi (Part 3, 4, 6, 7)
    if (isGroupMode) {
      if (!groupName.trim()) {
        setFormError('Vui lòng nhập tên chùm câu hỏi.');
        return;
      }
      if (!groupContext.trim()) {
        setFormError(
          section === 'LISTENING'
            ? 'Vui lòng nhập lời thoại chung của đoạn nghe.'
            : 'Vui lòng nhập đoạn văn đọc hiểu chung.'
        );
        return;
      }
      for (let i = 0; i < groupItems.length; i++) {
        const sub = groupItems[i];
        const label = `Câu con #${i + 1}`;
        if (!sub.name.trim()) {
          setFormError(`Vui lòng nhập tên cho ${label}.`);
          return;
        }
        if (sub.abilityIds.length === 0) {
          setFormError(`Vui lòng chọn ít nhất 1 năng lực cho ${label}.`);
          return;
        }
        if (!sub.optionA.trim() || !sub.optionB.trim() || !sub.optionC.trim() || !sub.optionD.trim()) {
          setFormError(`Vui lòng nhập đầy đủ 4 phương án A, B, C, D cho ${label}.`);
          return;
        }
      }

      setIsSubmitting(true);
      try {
        // Đóng gói payload tạo chùm câu hỏi theo CreateQuestionGroupRequest
        const payload: QuickCreateQuestionGroupPayload = {
          name: groupName.trim(),
          partId,
          instruction: groupInstruction.trim() || undefined,
          passage: section === 'READING' ? groupContext.trim() : undefined,
          transcript: section === 'LISTENING' ? groupContext.trim() : undefined,
          translation: groupTranslation.trim() || undefined,
          medias:
            uploadedMedias.length > 0
              ? uploadedMedias.map((m, idx) => ({ mediaId: m.id, orderNo: idx + 1 }))
              : undefined,
          items: groupItems.map((sub, idx) => ({
            name: sub.name.trim(),
            orderNo: idx + 1,
            text: sub.text.trim(),
            options: [
              { key: 'A', text: sub.optionA.trim() },
              { key: 'B', text: sub.optionB.trim() },
              { key: 'C', text: sub.optionC.trim() },
              { key: 'D', text: sub.optionD.trim() },
            ],
            correctKey: sub.correctKey,
            abilityIds: sub.abilityIds,
            difficulty: sub.difficulty,
            explanation: sub.analysis.trim() ? { analysis: sub.analysis.trim() } : undefined,
          })),
        };

        // Gọi API tạo chùm câu hỏi mới trong Ngân hàng câu hỏi
        const res = await adminModuleService.quickCreateQuestionGroup(payload);
        const createdGroup = res.data;
        const createdSubs = createdGroup?.subQuestions ?? [];

        if (res.success && createdGroup && createdSubs.length > 0) {
          // Chuyển toàn bộ câu con vừa tạo sang định dạng hiển thị để gắn vào bài học
          const attachedItems: PracticeQuestionResponse[] = createdSubs.map((sub) => ({
            questionId: sub.id,
            orderNo: 0,
            points: DEFAULT_PRACTICE_POINTS,
            questionName: sub.name,
            questionSummary: sub.text || '',
            questionType: createdGroup.type || 'SINGLE_CHOICE',
            partId: createdGroup.partId ?? partId,
            partName: createdGroup.partName ?? partName ?? null,
            section: createdGroup.section ?? section ?? null,
            difficulty: sub.difficulty ?? 2,
            parentId: createdGroup.id,
            parentName: createdGroup.name,
            abilityNames: sub.abilities?.map((a) => a.name) ?? [],
          }));

          toast.success(`Đã tạo chùm ${attachedItems.length} câu hỏi và thêm vào bài học!`);
          onCreatedAndAttach(attachedItems);
          onClose();
        }
      } catch (error: unknown) {
        const msg = extractApiError(error, 'Không thể tạo chùm câu hỏi. Vui lòng kiểm tra lại thông tin.');
        setFormError(msg);
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Luồng 2: Tạo nhanh Câu hỏi đơn (Part 1, 2, 5)
    if (!singleName.trim()) {
      setFormError('Vui lòng nhập tên gợi nhớ câu hỏi.');
      return;
    }
    if (singleAbilityIds.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 năng lực đánh giá.');
      return;
    }
    if (!singleOptA.trim() || !singleOptB.trim() || !singleOptC.trim()) {
      setFormError('Vui lòng nhập đầy đủ các phương án trả lời bắt buộc.');
      return;
    }
    if (!isThreeOptionPart && !singleOptD.trim()) {
      setFormError('Vui lòng nhập phương án D.');
      return;
    }
    if (isThreeOptionPart && singleCorrectKey === 'D') {
      setFormError('Part 2 chỉ có 3 phương án A, B, C.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Xây dựng mảng phương án (3 phương án cho Part 2, 4 phương án cho Part 1 & 5)
      const options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }> = [
        { key: 'A', text: singleOptA.trim() },
        { key: 'B', text: singleOptB.trim() },
        { key: 'C', text: singleOptC.trim() },
      ];
      if (!isThreeOptionPart) {
        options.push({ key: 'D', text: singleOptD.trim() });
      }

      // Đóng gói payload tạo câu hỏi đơn theo CreateStandaloneQuestionRequest
      const hasExplanation = Boolean(singleAnalysis.trim() || singleTranscript.trim());
      const payload: QuickCreateQuestionPayload = {
        name: singleName.trim(),
        partId,
        abilityIds: singleAbilityIds,
        difficulty: singleDifficulty,
        text: singleText.trim(),
        options,
        correctKey: singleCorrectKey,
        medias:
          uploadedMedias.length > 0
            ? uploadedMedias.map((m, idx) => ({ mediaId: m.id, orderNo: idx + 1 }))
            : undefined,
        explanation: hasExplanation
          ? {
              transcript: singleTranscript.trim() || undefined,
              analysis: singleAnalysis.trim() || undefined,
            }
          : undefined,
      };

      // Gọi API tạo câu hỏi đơn vào Ngân hàng câu hỏi
      const res = await adminModuleService.quickCreateStandaloneQuestion(payload);
      const created = res.data;

      if (res.success && created) {
        const attachedItem: PracticeQuestionResponse = {
          questionId: created.id,
          orderNo: 0,
          points: DEFAULT_PRACTICE_POINTS,
          questionName: created.name,
          questionSummary: created.text || singleText.trim(),
          questionType: created.type || 'SINGLE_CHOICE',
          partId: created.partId ?? partId,
          partName: created.partName ?? partName ?? null,
          section: created.section ?? section ?? null,
          difficulty: created.difficulty ?? singleDifficulty,
          parentId: null,
          parentName: null,
          abilityNames:
            created.abilities?.map((a) => a.name) ??
            scopedAbilities
              .filter((ab) => singleAbilityIds.includes(ab.id))
              .map((ab) => ab.name),
        };

        toast.success('Đã tạo câu hỏi mới và thêm vào bài học!');
        onCreatedAndAttach([attachedItem]);
        onClose();
      }
    } catch (error: unknown) {
      const msg = extractApiError(error, 'Không thể tạo câu hỏi. Vui lòng kiểm tra lại thông tin.');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pq-modal-backdrop" role="dialog" aria-modal="true" aria-label="Tạo nhanh câu hỏi">
      <div className={`pq-modal-panel ${isGroupMode ? 'pq-modal-panel-lg' : 'pq-modal-panel-md'}`}>
        {/* Phần đầu Modal */}
        <div className="pq-modal-header">
          <div>
            <h3 className="pq-modal-title">
              {isGroupMode ? 'Tạo nhanh chùm câu hỏi' : 'Tạo nhanh câu hỏi'}
            </h3>
            <p className="pq-modal-subtitle">
              Câu hỏi sau khi tạo sẽ tự động lưu vào Ngân hàng câu hỏi và gắn vào bài học này.
            </p>
          </div>
          <button type="button" className="pq-modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="pq-quick-form">
          <div className="pq-modal-body pq-quick-form-body">
            {/* Hiển thị lỗi validate chung nếu có */}
            {formError && <div className="pq-form-alert-error">{formError}</div>}

            {/* Ô Phần thi (Part) cố định ở dạng chỉ đọc theo mô-đun */}
            <div className="pq-form-field">
              <label className="pq-form-label">Phần thi (Part)</label>
              <div className="pq-locked-part-box">
                <Lock size={14} />
                <span>{partName || 'Chưa cấu hình Part cho mô-đun'}</span>
                <span className="pq-locked-mode-tag">
                  {isGroupMode ? 'Dạng chùm câu hỏi' : 'Dạng câu hỏi đơn'}
                </span>
              </div>
            </div>

            {/* Khu vực tải lên & xem trước Ảnh / Audio đính kèm (hỗ trợ Thêm / Thay thế / Xóa) */}
            <div className="pq-form-field">
              <div className="pq-media-upload-header">
                <label className="pq-form-label">
                  Tệp đính kèm (Ảnh / Audio)
                </label>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isUploadingMedia}
                  onClick={() => mediaInputRef.current?.click()}
                >
                  {isUploadingMedia ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      <span>Đang tải lên...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>{uploadedMedias.length > 0 ? 'Thêm Ảnh / Audio' : 'Tải Ảnh / Audio'}</span>
                    </>
                  )}
                </button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/mp3,audio/wav"
                  onChange={(e) => void handleUploadMediaFile(e)}
                  style={{ display: 'none' }}
                />
                <input
                  ref={replaceMediaInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/mp3,audio/wav"
                  onChange={(e) => void handleReplaceMediaFile(e)}
                  style={{ display: 'none' }}
                />
              </div>

              {mediaUploadError && <div className="pq-form-alert-error">{mediaUploadError}</div>}

              {uploadedMedias.length > 0 && (
                <div className="pq-media-preview-grid">
                  {uploadedMedias.map((media) => {
                    const isAudio =
                      media.kind === 'AUDIO' ||
                      media.resourceType === 'video' ||
                      /\.(mp3|wav|m4a|ogg)$/i.test(media.url);
                    return (
                      <div key={media.id} className="pq-media-preview-card">
                        <div className="pq-media-preview-top">
                          <span className="pq-media-preview-label" title={media.originalFilename || media.url}>
                            {isAudio ? <Music size={14} /> : <ImageIcon size={14} />}
                            <span>{media.originalFilename || `Media #${media.id}`}</span>
                          </span>
                          <div className="pq-media-preview-actions">
                            <button
                              type="button"
                              className="pq-icon-btn"
                              disabled={isUploadingMedia}
                              onClick={() => handleTriggerReplaceMedia(media.id)}
                              title="Thay thế tệp khác"
                            >
                              <RefreshCw size={13} />
                            </button>
                            <button
                              type="button"
                              className="pq-icon-btn pq-icon-btn-danger"
                              disabled={isUploadingMedia}
                              onClick={() => handleRemoveUploadedMedia(media.id)}
                              title="Xóa tệp"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {isAudio ? (
                          <audio src={media.url} controls className="pq-media-audio-player" />
                        ) : (
                          <a href={media.url} target="_blank" rel="noreferrer" className="pq-media-image-link">
                            <img
                              src={media.url}
                              alt={media.originalFilename || 'Hình ảnh đính kèm'}
                              className="pq-media-image-thumb"
                            />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= CHẾ ĐỘ 1: CÂU HỎI ĐƠN (Part 1, 2, 5) ================= */}
            {!isGroupMode && (
              <>
                <div className="pq-form-grid-2">
                  <div className="pq-form-field">
                    <label className="pq-form-label" htmlFor="qc-single-name">
                      Tên gợi nhớ <span className="req">*</span>
                    </label>
                    <input
                      id="qc-single-name"
                      type="text"
                      className="pq-form-input"
                      placeholder="VD: Câu 1 - Thì hiện tại hoàn thành"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                    />
                  </div>

                  <div className="pq-form-field">
                    <label className="pq-form-label" htmlFor="qc-single-diff">
                      Độ khó (1 - 5) <span className="req">*</span>
                    </label>
                    <select
                      id="qc-single-diff"
                      className="pq-form-input"
                      value={singleDifficulty}
                      onChange={(e) => setSingleDifficulty(Number(e.target.value))}
                    >
                      <option value={1}>1 - Cơ bản</option>
                      <option value={2}>2 - Dễ</option>
                      <option value={3}>3 - Trung bình</option>
                      <option value={4}>4 - Khá khó</option>
                      <option value={5}>5 - Nâng cao</option>
                    </select>
                  </div>
                </div>

                {/* Chọn năng lực trong phạm vi mô-đun */}
                <div className="pq-form-field">
                  <label className="pq-form-label">
                    Năng lực đánh giá <span className="req">*</span>
                  </label>
                  <div className="pq-ability-chips">
                    {scopedAbilities.map((ab) => (
                      <button
                        key={ab.id}
                        type="button"
                        className={`pq-ability-chip ${singleAbilityIds.includes(ab.id) ? 'active' : ''}`}
                        onClick={() => toggleSingleAbility(ab.id)}
                      >
                        {ab.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pq-form-field">
                  <label className="pq-form-label" htmlFor="qc-single-text">
                    Nội dung câu hỏi
                  </label>
                  <textarea
                    id="qc-single-text"
                    rows={3}
                    className="pq-form-textarea"
                    placeholder="Nhập nội dung câu hỏi..."
                    value={singleText}
                    onChange={(e) => setSingleText(e.target.value)}
                  />
                </div>

                <div className="pq-form-grid-2">
                  <div className="pq-form-field">
                    <label className="pq-form-label" htmlFor="qc-opt-a">
                      Phương án A <span className="req">*</span>
                    </label>
                    <input
                      id="qc-opt-a"
                      type="text"
                      className="pq-form-input"
                      value={singleOptA}
                      onChange={(e) => setSingleOptA(e.target.value)}
                    />
                  </div>
                  <div className="pq-form-field">
                    <label className="pq-form-label" htmlFor="qc-opt-b">
                      Phương án B <span className="req">*</span>
                    </label>
                    <input
                      id="qc-opt-b"
                      type="text"
                      className="pq-form-input"
                      value={singleOptB}
                      onChange={(e) => setSingleOptB(e.target.value)}
                    />
                  </div>
                  <div className="pq-form-field">
                    <label className="pq-form-label" htmlFor="qc-opt-c">
                      Phương án C <span className="req">*</span>
                    </label>
                    <input
                      id="qc-opt-c"
                      type="text"
                      className="pq-form-input"
                      value={singleOptC}
                      onChange={(e) => setSingleOptC(e.target.value)}
                    />
                  </div>
                  {!isThreeOptionPart && (
                    <div className="pq-form-field">
                      <label className="pq-form-label" htmlFor="qc-opt-d">
                        Phương án D <span className="req">*</span>
                      </label>
                      <input
                        id="qc-opt-d"
                        type="text"
                        className="pq-form-input"
                        value={singleOptD}
                        onChange={(e) => setSingleOptD(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="pq-form-field">
                  <label className="pq-form-label" htmlFor="qc-single-correct">
                    Đáp án đúng <span className="req">*</span>
                  </label>
                  <select
                    id="qc-single-correct"
                    className="pq-form-input pq-form-input-sm"
                    value={singleCorrectKey}
                    onChange={(e) => setSingleCorrectKey(e.target.value as 'A' | 'B' | 'C' | 'D')}
                  >
                    <option value="A">Đáp án A</option>
                    <option value="B">Đáp án B</option>
                    <option value="C">Đáp án C</option>
                    {!isThreeOptionPart && <option value="D">Đáp án D</option>}
                  </select>
                </div>

                {section === 'LISTENING' && (
                  <div className="pq-form-field">
                    <label className="pq-form-label" htmlFor="qc-single-transcript">
                      Lời thoại bài nghe (tùy chọn)
                    </label>
                    <textarea
                      id="qc-single-transcript"
                      rows={2}
                      className="pq-form-textarea"
                      placeholder="Nhập nội dung lời thoại âm thanh của câu hỏi..."
                      value={singleTranscript}
                      onChange={(e) => setSingleTranscript(e.target.value)}
                    />
                  </div>
                )}

                <div className="pq-form-field">
                  <label className="pq-form-label" htmlFor="qc-single-analysis">
                    Giải thích đáp án (tùy chọn)
                  </label>
                  <textarea
                    id="qc-single-analysis"
                    rows={2}
                    className="pq-form-textarea"
                    placeholder="Giải thích ngắn lý do chọn đáp án đúng..."
                    value={singleAnalysis}
                    onChange={(e) => setSingleAnalysis(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ================= CHẾ ĐỘ 2: CHÙM CÂU HỎI (Part 3, 4, 6, 7) ================= */}
            {isGroupMode && (
              <>
                <div className="pq-form-grid-2">
                  <div className="pq-form-field">
                    <label className="pq-form-label" htmlFor="qc-group-name">
                      Tên chùm câu hỏi <span className="req">*</span>
                    </label>
                    <input
                      id="qc-group-name"
                      type="text"
                      className="pq-form-input"
                      placeholder="VD: Email thông báo lịch họp quý 3"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  <div className="pq-form-field">
                    <label className="pq-form-label" htmlFor="qc-group-inst">
                      Lời hướng dẫn chung (tùy chọn)
                    </label>
                    <input
                      id="qc-group-inst"
                      type="text"
                      className="pq-form-input"
                      placeholder="VD: Questions 1-3 refer to the following email."
                      value={groupInstruction}
                      onChange={(e) => setGroupInstruction(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pq-form-field">
                  <label className="pq-form-label" htmlFor="qc-group-context">
                    {section === 'LISTENING' ? 'Lời thoại đoạn nghe chung' : 'Đoạn văn đọc hiểu chung'}{' '}
                    <span className="req">*</span>
                  </label>
                  <textarea
                    id="qc-group-context"
                    rows={4}
                    className="pq-form-textarea"
                    placeholder={
                      section === 'LISTENING'
                        ? 'Nhập nội dung đoạn hội thoại hoặc bài nói...'
                        : 'Nhập nội dung đoạn văn, email hoặc thông báo...'
                    }
                    value={groupContext}
                    onChange={(e) => setGroupContext(e.target.value)}
                  />
                </div>

                <div className="pq-form-field">
                  <label className="pq-form-label" htmlFor="qc-group-trans">
                    Bản dịch tiếng Việt (tùy chọn)
                  </label>
                  <textarea
                    id="qc-group-trans"
                    rows={2}
                    className="pq-form-textarea"
                    placeholder="Bản dịch nghĩa đoạn văn / lời thoại..."
                    value={groupTranslation}
                    onChange={(e) => setGroupTranslation(e.target.value)}
                  />
                </div>

                {/* Danh sách câu hỏi con trong chùm (2 - 5 câu) */}
                <div className="pq-subitems-header">
                  <span className="pq-form-label">
                    Danh sách câu hỏi con ({groupItems.length}/{MAX_GROUP_ITEMS})
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddSubItem}
                    disabled={groupItems.length >= MAX_GROUP_ITEMS}
                  >
                    <Plus size={14} />
                    <span>Thêm câu con</span>
                  </button>
                </div>

                <div className="pq-subitems-list">
                  {groupItems.map((sub, idx) => (
                    <div key={sub.keyId} className="pq-subitem-card">
                      <div className="pq-subitem-card-header">
                        <strong>Câu con #{idx + 1}</strong>
                        {groupItems.length > MIN_GROUP_ITEMS && (
                          <button
                            type="button"
                            className="pq-icon-btn pq-icon-btn-danger"
                            onClick={() => handleRemoveSubItem(idx)}
                            title="Xóa câu con"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="pq-form-grid-2">
                        <div className="pq-form-field">
                          <label className="pq-form-label">
                            Tên câu con <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="pq-form-input"
                            placeholder={`VD: Câu hỏi ${idx + 1}`}
                            value={sub.name}
                            onChange={(e) => updateSubItem(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="pq-form-field">
                          <label className="pq-form-label">Độ khó</label>
                          <select
                            className="pq-form-input"
                            value={sub.difficulty}
                            onChange={(e) => updateSubItem(idx, 'difficulty', Number(e.target.value))}
                          >
                            <option value={1}>1 - Cơ bản</option>
                            <option value={2}>2 - Dễ</option>
                            <option value={3}>3 - Trung bình</option>
                            <option value={4}>4 - Khá khó</option>
                            <option value={5}>5 - Nâng cao</option>
                          </select>
                        </div>
                      </div>

                      <div className="pq-form-field">
                        <label className="pq-form-label">
                          Năng lực đánh giá <span className="req">*</span>
                        </label>
                        <div className="pq-ability-chips">
                          {scopedAbilities.map((ab) => (
                            <button
                              key={ab.id}
                              type="button"
                              className={`pq-ability-chip ${sub.abilityIds.includes(ab.id) ? 'active' : ''}`}
                              onClick={() => toggleSubItemAbility(idx, ab.id)}
                            >
                              {ab.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pq-form-field">
                        <label className="pq-form-label">Nội dung câu hỏi</label>
                        <input
                          type="text"
                          className="pq-form-input"
                          placeholder="VD: What is the main purpose of this email?"
                          value={sub.text}
                          onChange={(e) => updateSubItem(idx, 'text', e.target.value)}
                        />
                      </div>

                      <div className="pq-form-grid-2">
                        <input
                          type="text"
                          className="pq-form-input"
                          placeholder="Phương án A *"
                          value={sub.optionA}
                          onChange={(e) => updateSubItem(idx, 'optionA', e.target.value)}
                        />
                        <input
                          type="text"
                          className="pq-form-input"
                          placeholder="Phương án B *"
                          value={sub.optionB}
                          onChange={(e) => updateSubItem(idx, 'optionB', e.target.value)}
                        />
                        <input
                          type="text"
                          className="pq-form-input"
                          placeholder="Phương án C *"
                          value={sub.optionC}
                          onChange={(e) => updateSubItem(idx, 'optionC', e.target.value)}
                        />
                        <input
                          type="text"
                          className="pq-form-input"
                          placeholder="Phương án D *"
                          value={sub.optionD}
                          onChange={(e) => updateSubItem(idx, 'optionD', e.target.value)}
                        />
                      </div>

                      <div className="pq-form-grid-2">
                        <div className="pq-form-field">
                          <label className="pq-form-label">Đáp án đúng *</label>
                          <select
                            className="pq-form-input"
                            value={sub.correctKey}
                            onChange={(e) =>
                              updateSubItem(idx, 'correctKey', e.target.value as 'A' | 'B' | 'C' | 'D')
                            }
                          >
                            <option value="A">Đáp án A</option>
                            <option value="B">Đáp án B</option>
                            <option value="C">Đáp án C</option>
                            <option value="D">Đáp án D</option>
                          </select>
                        </div>
                        <div className="pq-form-field">
                          <label className="pq-form-label">Giải thích ngắn</label>
                          <input
                            type="text"
                            className="pq-form-input"
                            placeholder="Tùy chọn..."
                            value={sub.analysis}
                            onChange={(e) => updateSubItem(idx, 'analysis', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Chân Modal */}
          <div className="pq-modal-footer pq-modal-footer-end">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>{isGroupMode ? 'Tạo chùm & Gắn vào bài học' : 'Tạo & Gắn vào bài học'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
