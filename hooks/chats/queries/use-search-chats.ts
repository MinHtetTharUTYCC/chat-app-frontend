'use client';

import { searchChats } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { useQuery } from '@tanstack/react-query';

export const useSearchChats = (q: string) => {
    return useQuery({
        queryKey: [...chatKeys.all, q],
        queryFn: () => searchChats(q),
        staleTime: 0,
        enabled: q.length > 0,
    });
};
