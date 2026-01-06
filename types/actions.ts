//chats
export type UpdateTitleResponse = {
    chatId: string;
    title: string;
};
export type LeaveGroupResponse = {
    success: boolean;
    chatId: string;
};
export type JoinGroupResponse = LeaveGroupResponse;

//messages
export type BaseMessageResponse = {
    messageId: string;
    chatId: string;
};
export type EditMessageResponse = BaseMessageResponse & {
    content: string;
};
export type PinMessageResponse = BaseMessageResponse;
export type UnpinMessageResponse = PinMessageResponse;
export type DeleteMessageResponse = BaseMessageResponse;

export type ActionResponse = {
    success: true;
};
