'use client';

import { getChatDetails } from '@/services/chats/chat.api';
import { chatKeys } from '@/services/chats/chat.keys';
import { useQuery } from '@tanstack/react-query';

export const useChatDetails = (chatId: string) =>
    useQuery({
        queryKey: chatKeys.chat(chatId),
        queryFn: () => getChatDetails(chatId),
        staleTime: 1000 * 60 * 5,
    });
