export type GroupAddedReceiver = {
    chatId: string;
    title: string;
    user: {
        id: string;
        username: string;
    };
};
export type UserJoinedGroupReceiver = GroupAddedReceiver;
export type UserLeftGroupReceiver = GroupAddedReceiver;
export type MembersAddedReceiver = GroupAddedReceiver & { addedMembersCount: number };

export type NewChatReceiver = {
    chatId: string;
    starter: {
        id: string;
        username: string;
    };
};
export type MessageEditedReceiver = {
    messageId: string;
    chatId: string;
    content: string;
    actor: {
        id: string;
        username: string;
    };
};

export type PinAddedReceiver = {
    chatId: string;
    messageId: string;
    actor: {
        id: string;
        username: string;
    };
};

export type TitleUpdateReceiver = {
    chatId: string;
    newTitle: string;
    actor: {
        id: string;
        username: string;
    };
};

export type TypingReceiver = {
    userId: string;
    chatId: string;
    isTyping: boolean;
};
