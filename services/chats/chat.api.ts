import { api } from '@/lib/api';
import { ChatItemResponse } from '@/types/types';

export const createGroup = async (title: string, userIds: string[]): Promise<ChatItemResponse> => {
    const { data } = await api.post('/chats/create-group', {
        title,
        userIds,
    });
    return data;
};

export const getChats = async (): Promise<ChatItemResponse[]> => {
    const { data } = await api.get('/chats');
    return data;
};
