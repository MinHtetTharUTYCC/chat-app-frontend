export const chatKeys = {
    all: ['chats'] as const,
    chat: (chatId: string) => [...chatKeys.all, chatId] as const,
    invite: (chatId: string) => ['invites', chatId] as const,
    invite_search: (chatId: string, q: string) => [...chatKeys.invite(chatId), q],
};
