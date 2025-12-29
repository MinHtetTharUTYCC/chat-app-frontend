export type EditMessageResponse = {
    messageId: string;
    content: string;
    chatId: string;
};

export type UpdateTitleResponse = {
    chatId: string;
    newTitle: string;
};

export type LeaveGroupResponse = {
    success: boolean;
    chatId: string;
};
