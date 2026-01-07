'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { ChatItem } from './chat-item';
import { useAppStore } from '@/hooks/use-app-store';
import { usePathname, useRouter } from 'next/navigation';
import { ChatItemResponse } from '@/types/chats';

function ChatItemsList({ chats }: { chats: ChatItemResponse[] }) {
    const pathname = usePathname();
    const router = useRouter();

    const { currentUser } = useAuthStore();
    const { setChatsOpen } = useAppStore();

    return (
        <>
            {chats?.map((chat) => {
                const otherParticipants = chat.participants.filter(
                    (parti) => parti.userId !== currentUser?.id
                );

                const isDM = !chat.isGroup && otherParticipants.length === 1;

                const displayName = isDM
                    ? otherParticipants[0]?.user.username || 'Unknown User'
                    : chat.title || 'Group Chat';

                const lastMessage = chat.messages?.[0];
                const lastMessageText = lastMessage
                    ? lastMessage.senderId === currentUser?.id
                        ? `You: ${lastMessage.content}`
                        : lastMessage.content
                    : 'No message yet';

                return (
                    <ChatItem
                        key={chat.id}
                        displayName={displayName}
                        isDM={isDM}
                        lastMsgText={lastMessageText}
                        isActive={
                            pathname === `/chats/${chat.id}` ||
                            pathname.startsWith(`/chats/${chat.id}/`)
                        }
                        otherParticipants={otherParticipants.map((p) => p.userId)}
                        timestamp={lastMessage?.updatedAt}
                        onClick={() => {
                            const chatRoute = `/chats/${chat.id}`;
                            setChatsOpen(false);
                            if (!pathname.startsWith(chatRoute)) {
                                router.push(chatRoute);
                            }
                        }}
                    />
                );
            })}
        </>
    );
}

export default ChatItemsList;
