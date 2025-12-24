export const messageKeys = {
    all: ['messages'] as const,
    chat: (chatId: string) => {
        const all = messageKeys.all;
        return [...all, chatId];
    },
};

export const pinnedKeys = {
    all: ['pinned'] as const,
    chat: (chatId: string) => {
        const all = pinnedKeys.all;
        return [...all, chatId];
    },
};
