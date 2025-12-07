'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export function useActiveChat() {
    const params = useParams();

    const chatId = useMemo(() => {
        const id = params?.chatId;
        return id;
    }, [params]);

    return chatId ? String(chatId) : null;
}
