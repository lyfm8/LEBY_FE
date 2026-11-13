import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminThresholdService } from '../services/adminThresholdService';
import { adminTargetService } from '@/features/admin/target/services/adminTargetService';
import type { TargetProfileResponse } from '@/features/admin/target/types';
import type { PartThresholdRow, AbilityRuleRow } from '../types';

export function useThresholdConfig() {
  const [profiles, setProfiles] = useState<TargetProfileResponse[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const [partRows, setPartRows] = useState<PartThresholdRow[]>([]);
  const [abilityRows, setAbilityRows] = useState<AbilityRuleRow[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [backendErrors, setBackendErrors] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 1. Tải danh sách TargetProfile (AIM) lần đầu
  useEffect(() => {
    let mounted = true;
    adminTargetService
      .getAllProfiles()
      .then((res) => {
        if (mounted && res.success && res.data && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => a.aimScore - b.aimScore);
          setProfiles(sorted);
          const defaultAim = sorted.find((p) => p.aimScore === 650) || sorted[0];
          setSelectedProfileId(defaultAim.id);
        }
      })
      .catch((err) => console.error('Lỗi nạp Target Profiles:', err));
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Nạp dữ liệu ma trận Part và Ability mỗi khi đổi AIM tab
  const loadMatrixData = useCallback(async (profileId: number) => {
    setIsLoading(true);
    setValidationErrors({});
    setBackendErrors([]);
    setIsDirty(false);
    try {
      const [partsRes, abilitiesRes] = await Promise.all([
        adminThresholdService.getPartThresholdMatrix(profileId),
        adminThresholdService.getAbilityRuleMatrix(profileId),
      ]);

      if (partsRes.success && partsRes.data) {
        setPartRows(partsRes.data.rows);
      }
      if (abilitiesRes.success && abilitiesRes.data) {
        setAbilityRows(abilitiesRes.data.rows);
      }
    } catch (error) {
      console.error('Lỗi nạp ma trận ngưỡng:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProfileId) {
      loadMatrixData(selectedProfileId);
    }
  }, [selectedProfileId, loadMatrixData]);

  // 3. Cập nhật giá trị ô input của Part (cho phép null khi người dùng xóa trắng)
  const updatePartRow = useCallback(
    (partId: number, field: 'passScore' | 'confirmingScore', value: number | null) => {
      setPartRows((prev) =>
        prev.map((row) => (row.partId === partId ? { ...row, [field]: value } : row))
      );
      setIsDirty(true);
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[`part_${partId}`];
        return next;
      });
      setBackendErrors([]);
    },
    []
  );

  // 4. Cập nhật giá trị ô input của Ability (cho phép null khi xóa trắng)
  const updateAbilityRow = useCallback((abilityId: number, value: number | null) => {
    setAbilityRows((prev) =>
      prev.map((row) => (row.abilityId === abilityId ? { ...row, stableMin: value } : row))
    );
    setIsDirty(true);
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[`ability_${abilityId}`];
      return next;
    });
    setBackendErrors([]);
  }, []);

  // 5. Kiểm tra tính hợp lệ toàn diện khi người dùng bấm Lưu (theo tài liệu UC A08 & A10)
  const validateBeforeSave = useCallback((): boolean => {
    const errorsList: string[] = [];
    const fieldErrors: Record<string, string> = {};

    // 5.1. Kiểm tra ma trận Part (A08)
    let hasEmptyPart = false;
    for (const p of partRows) {
      if (p.passScore === null || p.confirmingScore === null) {
        hasEmptyPart = true;
        fieldErrors[`part_${p.partId}`] = 'Chưa điền đủ ngưỡng';
      } else {
        if (p.passScore < 0 || p.passScore > 100 || p.confirmingScore < 0 || p.confirmingScore > 100) {
          errorsList.push(`Lỗi tại ${p.partName}: Giá trị phần trăm phải nằm trong khoảng từ 0% đến 100%!`);
          fieldErrors[`part_${p.partId}`] = 'Phải từ 0% - 100%';
        }
        if (p.confirmingScore >= p.passScore) {
          errorsList.push(`Lỗi logic tại ${p.partName}: Ngưỡng cận chuẩn (${p.confirmingScore}%) phải nhỏ hơn Ngưỡng đạt chuẩn (${p.passScore}%)!`);
          fieldErrors[`part_${p.partId}`] = 'Cận chuẩn phải < Đạt chuẩn';
        }
      }
    }
    if (hasEmptyPart) {
      errorsList.unshift('Vui lòng nhập đầy đủ giá trị ngưỡng cho toàn bộ 7 Part trước khi lưu');
    }

    // 5.2. Kiểm tra ma trận Ability (A10)
    let hasEmptyAbility = false;
    for (const a of abilityRows) {
      if (a.stableMin === null) {
        hasEmptyAbility = true;
        fieldErrors[`ability_${a.abilityId}`] = 'Chưa điền ngưỡng';
      } else if (a.stableMin < 0 || a.stableMin > 100) {
        errorsList.push(`Lỗi tại Năng lực ${a.abilityName}: Giá trị phần trăm phải nằm trong khoảng từ 0% đến 100%!`);
        fieldErrors[`ability_${a.abilityId}`] = 'Phải từ 0% - 100%';
      }
    }
    if (hasEmptyAbility) {
      errorsList.push('Vui lòng nhập đầy đủ giá trị ngưỡng cho toàn bộ Năng lực trước khi lưu');
    }

    setValidationErrors(fieldErrors);
    setBackendErrors(errorsList);
    return errorsList.length === 0;
  }, [partRows, abilityRows]);

  // 6. Lưu cấu hình đồng loạt khi bấm Lưu
  const saveAll = useCallback(async () => {
    if (!selectedProfileId) return;

    // Kiểm tra hợp lệ trước khi lưu
    const isValid = validateBeforeSave();
    if (!isValid) return;

    setIsSaving(true);
    setBackendErrors([]);
    try {
      await Promise.all([
        adminThresholdService.savePartThresholdsBatch({
          targetProfileId: selectedProfileId,
          thresholds: partRows.map((p) => ({
            partId: p.partId,
            passScore: p.passScore,
            confirmingScore: p.confirmingScore,
          })),
        }),
        adminThresholdService.saveAbilityRulesBatch({
          targetProfileId: selectedProfileId,
          rules: abilityRows.map((a) => ({
            abilityId: a.abilityId,
            stableMin: a.stableMin,
          })),
        }),
      ]);

      setIsDirty(false);
      setSuccessToast('Cập nhật cấu hình ngưỡng và quy tắc thành công');
      setTimeout(() => setSuccessToast(null), 3500);
      loadMatrixData(selectedProfileId);
    } catch (err: unknown) {
      console.error('Lưu cấu hình thất bại:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg = apiErr.response?.data?.message || 'Mất kết nối cơ sở dữ liệu khi đang lưu cấu hình. Vui lòng thử lại!';
      setBackendErrors([msg]);
    } finally {
      setIsSaving(false);
    }
  }, [selectedProfileId, validateBeforeSave, partRows, abilityRows, loadMatrixData]);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId) || null,
    [profiles, selectedProfileId]
  );

  return {
    profiles,
    selectedProfileId,
    selectedProfile,
    setSelectedProfileId,
    partRows,
    abilityRows,
    isLoading,
    isSaving,
    isDirty,
    validationErrors,
    backendErrors,
    successToast,
    updatePartRow,
    updateAbilityRow,
    saveAll,
  };
}
