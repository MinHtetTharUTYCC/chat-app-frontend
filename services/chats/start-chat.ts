import { api } from '@/lib/api';
import { ChatItemResponse } from '@/types/types';

export const startChat = async (otherUserId: string): Promise<ChatItemResponse> => {
    const { data } = await api.post('/chats/start', {
        otherUserId,
    });
    return data;
};
