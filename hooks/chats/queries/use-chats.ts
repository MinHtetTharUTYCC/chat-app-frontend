'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { getChats } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { useQuery } from '@tanstack/react-query';

export const useChats = () => {
    const { accessToken, authReady } = useAuthStore();

    return useQuery({
        queryKey: chatKeys.all,
        queryFn: getChats,
        staleTime: 1000 * 60 * 5,
        enabled: !!accessToken && authReady,
    });
};
