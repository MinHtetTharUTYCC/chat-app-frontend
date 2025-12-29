import { api } from '@/lib/api';
import { LeaveGroupResponse, UpdateTitleResponse } from '@/types/actions';
import { ChatDetailsResponse, ChatItemResponse } from '@/types/chats';

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

export const getChatDetails = async (chatId: string): Promise<ChatDetailsResponse> => {
    const { data } = await api.get(`/chats/${chatId}`);
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
