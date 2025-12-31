export const chatKeys = {
    all: ['chats'] as const,
    chat: (chatId: string) => [...chatKeys.all, chatId] as const,
};
