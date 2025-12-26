import { api } from '@/lib/api';
import { ChatItemResponse, LeaveGroupResponse, UpdateTitleResponse } from '@/types/types';

export const startChat = async (
    otherUserId: string
): Promise<{ oldChatExists: boolean; chat: ChatItemResponse | { id: string } }> => {
    const { data } = await api.post('/chats/start', {
        otherUserId,
    });
    return data;
};

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

export const updateTitle = async (chatId: string, title: string): Promise<UpdateTitleResponse> => {
    const { data } = await api.patch(`/chats/${chatId}/update-title`, { title });
    return data;
};
export const leaveGroup = async (chatId: string): Promise<LeaveGroupResponse> => {
    const { data } = await api.delete(`/chats/${chatId}/participants/leave-group`);
    return data;
};
