import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminQuestionService } from '../services/adminQuestionService';
import { usePartAbilityOptions } from './usePartAbilityOptions';
import type {
  CreateStandaloneQuestionPayload,
  QuestionExplanation,
  QuestionMediaItem,
  QuestionOption,
} from '../types';

/**
 * Custom hook quản lý toàn bộ Form State và nghiệp vụ biên soạn Câu hỏi đơn (Standalone Question).
 * Phục vụ QuestionStandaloneEditorPage (Part 1, Part 2, Part 5).
 *
 * @param id ID của câu hỏi cần chỉnh sửa (nếu có)
 */
export function useStandaloneQuestionEditor(id?: string) {
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState<string>('');
  const [partId, setPartId] = useState<number | undefined>(undefined);
  const [abilityIds, setAbilityIds] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<number>(3);
  const [text, setText] = useState<string>('');
  const [options, setOptions] = useState<QuestionOption[]>([
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ]);
  const [correctKey, setCorrectKey] = useState<string>('A');
  const [explanation, setExplanation] = useState<QuestionExplanation>({
    transcript: '',
    translation: '',
    clue: '',
    analysis: '',
    vocabulary: [],
  });
  const [medias, setMedias] = useState<QuestionMediaItem[]>([]);
  const [descriptions, setDescriptions] = useState<string>('');

  // UI State
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
          setDifficulty(q.difficulty || 3);
          setText(q.text || '');
          if (q.options && q.options.length > 0) {
            setOptions(q.options);
          }
          if (q.correctKey) {
            setCorrectKey(q.correctKey);
          }
          if (q.explanation) {
            setExplanation(q.explanation);
          }
          if (q.medias) {
            setMedias(q.medias);
          }
          if (q.descriptions) {
            setDescriptions(q.descriptions);
          }
          if (q.abilities) {
            setAbilityIds(q.abilities.map((a) => a.abilityId));
          }
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (err as { message?: string })?.message ||
            'Không thể tải dữ liệu câu hỏi để chỉnh sửa';
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
   * Validate dữ liệu form trước khi submit.
   */
  const validateForm = useCallback((): boolean => {
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên gợi nhớ câu hỏi');
      return false;
    }
    if (!partId) {
      setFormError('Vui lòng chọn Phần thi (Part)');
      return false;
    }
    if (!abilityIds || abilityIds.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 kỹ năng năng lực (Ability)');
      return false;
    }
    const emptyOption = options.find((o) => !o.text.trim());
    if (emptyOption) {
      setFormError(`Phương án (${emptyOption.key}) chưa được nhập nội dung`);
      return false;
    }
    if (!options.some((o) => o.key.toUpperCase() === correctKey.toUpperCase())) {
      setFormError('Đáp án đúng được chọn không khớp với bất kỳ phương án nào');
      return false;
    }
    setFormError(null);
    return true;
  }, [name, partId, abilityIds, options, correctKey]);

  /**
   * Xử lý submit form tạo mới hoặc cập nhật câu hỏi đơn.
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      const payload: CreateStandaloneQuestionPayload = {
        name: name.trim(),
        partId: partId!,
        abilityIds,
        difficulty,
        text: text.trim(),
        options,
        correctKey: correctKey.toUpperCase(),
        explanation,
        medias,
        descriptions: descriptions.trim(),
      };

      setIsSaving(true);
      try {
        if (isEditMode) {
          await adminQuestionService.updateStandalone(Number(id), payload);
        } else {
          await adminQuestionService.createStandalone(payload);
        }
        navigate('/admin/questions');
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Lưu câu hỏi thất bại, vui lòng kiểm tra lại dữ liệu';
        setFormError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      validateForm,
      name,
      partId,
      abilityIds,
      difficulty,
      text,
      options,
      correctKey,
      explanation,
      medias,
      descriptions,
      isEditMode,
      id,
      navigate,
    ]
  );

  /**
   * Toggle chọn/bỏ chọn một Ability.
   */
  const handleToggleAbility = useCallback((abilityId: number) => {
    setAbilityIds((prev) =>
      prev.includes(abilityId) ? prev.filter((a) => a !== abilityId) : [...prev, abilityId]
    );
  }, []);

  // Pre-flight check trạng thái sẵn sàng
  const hasValidName = name.trim().length > 0;
  const hasValidOptions = options.length >= 3 && options.every((o) => o.text.trim().length > 0);
  const isReadyToSubmit = useMemo(
    () => hasValidName && !!partId && abilityIds.length > 0 && hasValidOptions,
    [hasValidName, partId, abilityIds.length, hasValidOptions]
  );

  return {
    isEditMode,
    name,
    setName,
    partId,
    setPartId,
    abilityIds,
    setAbilityIds,
    handleToggleAbility,
    difficulty,
    setDifficulty,
    text,
    setText,
    options,
    setOptions,
    correctKey,
    setCorrectKey,
    explanation,
    setExplanation,
    medias,
    setMedias,
    descriptions,
    setDescriptions,
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
    hasValidName,
    hasValidOptions,
    isReadyToSubmit,
    handleSubmit,
    validateForm,
  };
}
