import { useEffect, useState } from 'react';
import { adminPartService } from '@/features/admin/part/services/adminPartService';
import type { AbilityResponse, PartResponse } from '@/features/admin/part/types';

export function usePartAbilityOptions(selectedPartId?: number) {
    const [parts, setParts] = useState<PartResponse[]>([]);
    const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
    const [isLoadingParts, setIsLoadingParts] = useState<boolean>(false);
    const [isLoadingAbilities, setIsLoadingAbilities] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        setIsLoadingParts(true);
        adminPartService
            .getParts()
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setParts(res.data);
                }
            })
            .catch(() => {
                // Ignore or handle silently
            })
            .finally(() => {
                if (isMounted) setIsLoadingParts(false);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedPartId) {
            setAbilities([]);
            return;
        }

        let isMounted = true;
        setIsLoadingAbilities(true);
        adminPartService
            .getAbilities(selectedPartId)
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setAbilities(res.data);
                }
            })
            .catch(() => {
                if (isMounted) setAbilities([]);
            })
            .finally(() => {
                if (isMounted) setIsLoadingAbilities(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedPartId]);

    const selectedPart = parts.find((p) => p.id === selectedPartId);

    return {
        parts,
        abilities,
        selectedPart,
        isLoadingParts,
        isLoadingAbilities,
    };
}

