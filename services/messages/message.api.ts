import { api } from '@/lib/api';
import {
    MessageItem,
    MessagesResponse,
    PinnedResponse,
    SearchedMessageItem,
} from '@/types/messages';
import {
    DeleteMessageResponse,
    EditMessageResponse,
    PinMessageResponse,
    UnpinMessageResponse,
} from '@/types/actions';

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

export const deleteMessage = async (
    chatId: string,
    messageId: string
): Promise<DeleteMessageResponse> => {
    const { data } = await api.delete(`/chats/${chatId}/messages/${messageId}`);
    return data;
};

export const pinMessage = async (
    chatId: string,
    messageId: string
): Promise<PinMessageResponse> => {
    const { data } = await api.post(`/chats/${chatId}/messages/${messageId}/pin`);
    return data;
};

export const unpinMessage = async (
    chatId: string,
    messageId: string
): Promise<UnpinMessageResponse> => {
    const { data } = await api.delete(`/chats/${chatId}/messages/${messageId}/pin`);
    return data;
};

export const getPinned = async (
    chatId: string,
    cursor?: string,
    limit: number = 10
): Promise<PinnedResponse> => {
    if (limit <= 0) {
        throw new Error('Limit must be a positive number');
    }
    const { data } = await api.get(`/chats/${chatId}/pinned`, {
        params: { cursor, limit },
    });
    return data;
};

export const searchMessagesInChat = async (
    chatId: string,
    q: string
): Promise<SearchedMessageItem[]> => {
    const { data } = await api.get(`/search/chats/${chatId}`, {
        params: { q },
    });

    return data;
};
