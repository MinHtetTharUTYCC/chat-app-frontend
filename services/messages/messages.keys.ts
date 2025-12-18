export const messageKeys = {
    all: ['messages'] as const,
    list: (chatId: string, jumpToMessageId?: string, jumpToDate?: string) =>
        [...messageKeys, chatId, jumpToMessageId ?? null, jumpToDate ?? null] as const,
};
