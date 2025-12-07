interface ToastRulesNewMsgParams {
    activeChatId: string | null;
    messageChatId: string;
    senderId: string;
    currentUserId: string;
}

interface ToastRulesTitleUpdateParams {
    activeChatId: string | null;
    titleChatId: string;
    senderId: string;
    currentUserId: string;
}

export function shouldShowMessageToast({
    activeChatId,
    messageChatId,
    senderId,
    currentUserId,
}: ToastRulesNewMsgParams) {
    // ignore my own messages
    if (senderId === currentUserId) return false;

    //ignore if im 'currently viewing chat
    if (messageChatId === activeChatId) return false;

    return true;
}

export function shouldShowTitleUpdateToast({
    activeChatId,
    titleChatId,
    senderId,
    currentUserId,
}: ToastRulesTitleUpdateParams) {
    // ignore my own title update
    if (senderId === currentUserId) return false;

    //ignore if im 'currently viewing chat
    if (titleChatId === activeChatId) return false;

    return true;
}
