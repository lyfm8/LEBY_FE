import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminQuestionService } from '../services/adminQuestionService';
import { usePartAbilityOptions } from './usePartAbilityOptions';
import type {
  CreateQuestionGroupPayload,
  QuestionGroupItem,
  QuestionMediaItem,
} from '../types';

/**
 * Custom hook quản lý toàn bộ Form State và nghiệp vụ biên soạn Chùm câu hỏi (Question Group).
 * Phục vụ QuestionGroupEditorPage (Part 3, 4, 6, 7).
 *
 * @param id ID của chùm câu hỏi cần chỉnh sửa (nếu có)
 */
export function useGroupQuestionEditor(id?: string) {
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Group Parent State
  const [name, setName] = useState<string>('');
  const [partId, setPartId] = useState<number | undefined>(undefined);
  const [instruction, setInstruction] = useState<string>('');
  const [passage, setPassage] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [groupMedias, setGroupMedias] = useState<QuestionMediaItem[]>([]);
  const [descriptions, setDescriptions] = useState<string>('');

  // Sub-questions items (2 đến 5 câu)
  const [items, setItems] = useState<QuestionGroupItem[]>([
    {
      name: 'Câu hỏi 1',
      text: '',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ],
      correctKey: 'A',
      abilityIds: [],
      difficulty: 3,
      explanation: {},
    },
    {
      name: 'Câu hỏi 2',
      text: '',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ],
      correctKey: 'A',
      abilityIds: [],
      difficulty: 3,
      explanation: {},
    },
  ]);

  // UI state
  const [expandedItemIndex, setExpandedItemIndex] = useState<number>(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Options Part & Ability
  const { parts, abilities, selectedPart, isLoadingParts, isLoadingAbilities } =
    usePartAbilityOptions(partId);

  // Load data khi ở chế độ Edit
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoadingInitial(true);

    adminQuestionService
      .getById(Number(id))
      .then((res) => {
        if (isMounted && res.success && res.data) {
          const q = res.data;
          setName(q.name || '');
          setPartId(q.partId);
          setInstruction(q.instruction || '');
          setPassage(q.passage || '');
          setDescriptions(q.descriptions || '');
          if (q.explanation) {
            setTranscript(q.explanation.transcript || '');
            setTranslation(q.explanation.translation || '');
          }
          if (q.medias) {
            setGroupMedias(q.medias);
          }
          if (q.items && q.items.length > 0) {
            setItems(
              q.items.map((it) => ({
                id: it.id,
                name: it.name || '',
                text: it.text || '',
                options:
                  it.options && it.options.length > 0
                    ? it.options
                    : [
                        { key: 'A', text: '' },
                        { key: 'B', text: '' },
                        { key: 'C', text: '' },
                        { key: 'D', text: '' },
                      ],
                correctKey: it.correctKey || 'A',
                abilityIds: it.abilities?.map((a) => a.abilityId) || [],
                difficulty: it.difficulty || 3,
                explanation: it.explanation || {},
              }))
            );
          }
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (err as { message?: string })?.message ||
            'Không thể tải thông tin chùm câu hỏi';
          setFormError(message);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingInitial(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  /**
   * Thêm một câu hỏi con mới vào chùm (tối đa 5 câu).
   */
  const handleAddItem = useCallback(() => {
    setItems((prev) => {
      if (prev.length >= 5) return prev;
      const newIndex = prev.length + 1;
      return [
        ...prev,
        {
          name: `Câu hỏi ${newIndex}`,
          text: '',
          options: [
            { key: 'A', text: '' },
            { key: 'B', text: '' },
            { key: 'C', text: '' },
            { key: 'D', text: '' },
          ],
          correctKey: 'A',
          abilityIds: prev[0]?.abilityIds || [],
          difficulty: 3,
          explanation: {},
        },
      ];
    });
    setExpandedItemIndex((prev) => Math.min(prev + 1, 4));
  }, []);

  /**
   * Xóa một câu hỏi con khỏi chùm (giữ tối thiểu 2 câu).
   */
  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => {
      if (prev.length <= 2) {
        setFormError('Chùm câu hỏi phải có tối thiểu 2 câu hỏi con');
        return prev;
      }
      return prev.filter((_, idx) => idx !== index);
    });
    setExpandedItemIndex((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Di chuyển vị trí câu hỏi con lên hoặc xuống.
   */
  const handleMoveItem = useCallback((index: number, direction: 'UP' | 'DOWN') => {
    setItems((prev) => {
      const targetIndex = direction === 'UP' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    setExpandedItemIndex(direction === 'UP' ? index - 1 : index + 1);
  }, []);

  /**
   * Cập nhật một trường dữ liệu của câu hỏi con.
   */
  const handleUpdateItem = useCallback(
    <K extends keyof QuestionGroupItem>(
      index: number,
      field: K,
      value: QuestionGroupItem[K]
    ) => {
      setItems((prev) =>
        prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
      );
    },
    []
  );

  /**
   * Validate toàn bộ dữ liệu của chùm câu hỏi.
   */
  const validateForm = useCallback((): boolean => {
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên cho chùm câu hỏi');
      return false;
    }
    if (!partId) {
      setFormError('Vui lòng chọn Phần thi (Part)');
      return false;
    }
    if (items.length < 2 || items.length > 5) {
      setFormError('Chùm câu hỏi phải có từ 2 đến 5 câu hỏi con');
      return false;
    }

    // Validate từng câu con
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.name.trim()) {
        setFormError(`Câu hỏi con thứ ${i + 1} chưa có tên gợi nhớ`);
        setExpandedItemIndex(i);
        return false;
      }
      if (it.abilityIds.length === 0) {
        setFormError(`Câu hỏi con thứ ${i + 1} chưa được gán kỹ năng (Ability)`);
        setExpandedItemIndex(i);
        return false;
      }
      if (it.options.length < 3 || it.options.length > 4) {
        setFormError(`Câu hỏi con thứ ${i + 1} phải có từ 3 đến 4 phương án trả lời`);
        setExpandedItemIndex(i);
        return false;
      }
      if (!it.options.some((opt) => opt.key.toUpperCase() === it.correctKey.toUpperCase())) {
        setFormError(`Câu hỏi con thứ ${i + 1} chưa chọn đáp án đúng hợp lệ`);
        setExpandedItemIndex(i);
        return false;
      }
    }

    setFormError(null);
    return true;
  }, [name, partId, items]);

  /**
   * Xử lý submit form tạo mới hoặc cập nhật chùm câu hỏi.
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      if (!validateForm()) return;

      const payload: CreateQuestionGroupPayload = {
        name: name.trim(),
        partId: partId!,
        instruction: instruction.trim(),
        passage: passage.trim(),
        transcript: transcript.trim(),
        translation: translation.trim(),
        descriptions: descriptions.trim(),
        medias: groupMedias.map((m, idx) => ({ mediaId: m.mediaId, orderNo: idx + 1 })),
        items: items.map((it, idx) => ({
          id: it.id,
          name: it.name.trim(),
          orderNo: idx + 1,
          text: it.text?.trim() || '',
          options: it.options,
          correctKey: it.correctKey.toUpperCase(),
          abilityIds: it.abilityIds,
          difficulty: it.difficulty,
          explanation: it.explanation,
        })),
      };

      setIsSaving(true);
      try {
        if (isEditMode) {
          await adminQuestionService.updateGroup(Number(id), payload);
        } else {
          await adminQuestionService.createGroup(payload);
        }
        navigate('/admin/questions');
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Lưu chùm câu hỏi thất bại, vui lòng kiểm tra lại';
        setFormError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      validateForm,
      name,
      partId,
      instruction,
      passage,
      transcript,
      translation,
      descriptions,
      groupMedias,
      items,
      isEditMode,
      id,
      navigate,
    ]
  );

  return {
    isEditMode,
    name,
    setName,
    partId,
    setPartId,
    instruction,
    setInstruction,
    passage,
    setPassage,
    transcript,
    setTranscript,
    translation,
    setTranslation,
    groupMedias,
    setGroupMedias,
    descriptions,
    setDescriptions,
    items,
    setItems,
    expandedItemIndex,
    setExpandedItemIndex,
    isLoadingInitial,
    isSaving,
    formError,
    setFormError,
    showPreview,
    setShowPreview,
    parts,
    abilities,
    selectedPart,
    isLoadingParts,
    isLoadingAbilities,
    handleAddItem,
    handleRemoveItem,
    handleMoveItem,
    handleUpdateItem,
    handleSubmit,
    validateForm,
  };
}
