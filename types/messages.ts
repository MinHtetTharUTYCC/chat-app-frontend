import { InfiniteData } from '@tanstack/react-query';

export type MessageItem = {
    id: string;
    content: string;
    chatId: string;
    senderId: string;
    sender: {
        id: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    isPinned: boolean;
    pinnedByUserId: string | null;
    _optimistic?: boolean;
};
export type MessagesResponse = {
    messages: MessageItem[];
    meta: {
        nextCursor?: string | null;
        prevCursor?: string | null;
    };
};
export type MessageInfiniteData = InfiniteData<MessagesResponse>;

export type PinItem = {
    id: string;
    chatId: string;
    messageId: string;
    pinnedByUserId: string;
    user: {
        id: string;
        username: string;
    };
    message: {
        id: string;
        content: string;
        senderId: string;
    };
    createdAt: string;
};
export type PinnedResponse = {
    pinnedMessages: PinItem[];
    meta: {
        nextCursor?: string | null;
    };
};
export type PinnedInfiniteData = InfiniteData<PinnedResponse>;

export type SearchedMessageItem = Omit<MessageItem, 'isPinned' | 'pinnedByUserId' | '_optimistic'>;
