import { api } from '@/lib/api';
import { MessageItem, MessagesResponse, PinnedResponse } from '@/types/messages';
import { EditMessageResponse } from '@/types/actions';

export interface MessageQueryParams {
    limit: number;
    nextCursor?: string;
    prevCursor?: string;
    aroundMessageId?: string;
    aroundDate?: string;
}

export const getMessages = async (
    chatId: string,
    params: MessageQueryParams
): Promise<MessagesResponse> => {
    const { data } = await api.get(`/chats/${chatId}/messages`, { params });
    return data;
};

export const sendMessage = async (chatId: string, content: string): Promise<MessageItem> => {
    const { data } = await api.post(`/chats/${chatId}/messages`, { content });
    return data;
};

export const editMessage = async (
    chatId: string,
    messageId: string,
    content: string
): Promise<EditMessageResponse> => {
    const { data } = await api.patch(`/chats/${chatId}/messages/${messageId}`, { content });
    return data;
};

export interface ActionResponse {
    success: boolean;
}

export const deleteMessage = async (chatId: string, messageId: string): Promise<ActionResponse> => {
    const { data } = await api.delete(`/chats/${chatId}/messages/${messageId}`);
    return data;
};

export const pinMessage = async (chatId: string, messageId: string): Promise<ActionResponse> => {
    const { data } = await api.post(`/chats/${chatId}/messages/${messageId}/pin`);
    return data;
};

export const unpinMessage = async (chatId: string, messageId: string): Promise<ActionResponse> => {
    const { data } = await api.delete(`/chats/${chatId}/messages/${messageId}/pin`);
    return data;
};

export const getPinned = async (
    chatId: string,
    cursor?: string,
    limit: number = 10
): Promise<PinnedResponse> => {
    const { data } = await api.get(`/chats/${chatId}/pinned`, {
        params: { cursor, limit },
    });
    return data;
};
