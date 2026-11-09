import React from 'react';
import { Image, Video, Volume2 } from 'lucide-react';
import type { MediaKind } from '../../types';

interface MediaKindIconProps {
    kind: MediaKind;
    size?: number;
    className?: string;
}

export const MediaKindIcon: React.FC<MediaKindIconProps> = ({ kind, size = 16, className = '' }) => {
    switch (kind) {
        case 'AUDIO':
            return <Volume2 size={size} className={`text-blue-500 ${className}`} />;
        case 'VIDEO':
            return <Video size={size} className={`text-purple-500 ${className}`} />;
        case 'IMAGE':
        default:
            return <Image size={size} className={`text-emerald-500 ${className}`} />;
    }
};

