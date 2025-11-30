export function isChatActiveAtUrl(url: string): boolean {
    const chatUrlPattern = /^\/chats\/[a-zA-Z0-9_-]+$/;
    return chatUrlPattern.test(url);
}