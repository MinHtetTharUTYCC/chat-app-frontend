export type ChatItemResponse = {
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
};

export type UserParticipant = {
    user: {
        id: string;
        username: string;
    };
};
export type ChatDetailsResponse = {
    id: string;
    title: string | null;
    isGroup: boolean;
    createdAt: string;
    participants: Array<UserParticipant>;
    participantsCount?: number;
    isParticipant: boolean;
};

export type ChatsListQueryData = ChatItemResponse[] | undefined;
export type ChatDetailsQueryData = ChatDetailsResponse | undefined;
