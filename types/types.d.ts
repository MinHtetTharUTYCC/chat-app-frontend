export interface ChatItemResponse {
    id: string;
    isGroup: boolean;
    title: string | null;
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string;

    participants: {
        id: string;
        userId: string;
        chatId: string;
        user: { id: string; username: string };
    }[];
    messages: {
        id: string;
        content: string;
        createdAt: string;
        updatedAt: string;
        senderId: string;
        sender: { id: string; username: string };
    }[];
}
export type NotificationItem = {
    id: string;
    chatId: string;
    receiverId: string;
    actorId: string;
    actor: {
        id: string;
        username: string;
    };
    chat: {
        id: string;
        title: string | null;
    };
    type: 'NEW_CHAT' | 'GROUP_ADDED' | 'MESSAGED_PINNED';
    data?: JSON;
    isRead: boolean;
    createdAt: string;
};

export type NotiResponse = {
    data: NotificationItem[];
    meta: {
        hasMore: boolean;
        nextCursor: string | null;
    };
};

export type PresenceResponse = Record<string, { online: boolean; lastSeen: string | null }>;

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
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

export type PinItem = {
    id: string;
    chatId: string;
    messageId: string;
    message: {
        content: string;
        id: string;
    };
    createdAt: string;
    user: {
        id: string;
        username: string;
    };
    pinnedByUserId: string | null;
};

export type UpdateTitleResponse = {
    success: boolean;
    chatId: string;
    newTitle: string;
};

export type LeaveGroupResponse = {
    success: boolean;
    chatId: string;
};
