'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { ChatItem } from './chat-item';
import { useAppStore } from '@/hooks/use-app-store';
import { usePathname, useRouter } from 'next/navigation';
import { ChatItemResponse } from '@/types/types';
import { useEffect, useRef } from 'react';

function ChatItemsList({ chats }: { chats: ChatItemResponse[] }) {
    const pathname = usePathname();
    const router = useRouter();

    const pendingNavigationRef = useRef(false);

    const { currentUser } = useAuthStore();
    const { setChatsOpen } = useAppStore();

    //close list after navigation complete
    useEffect(() => {
        if (pendingNavigationRef.current) {
            setChatsOpen(false);
            pendingNavigationRef.current = false;
        }
    }, [pathname, setChatsOpen]);

    return (
        <>
            {chats?.map((chat: any) => {
                const otherParticipants = chat.participants.filter(
                    (parti: any) => parti.userId !== currentUser?.id
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
                        id={chat.id}
                        displayName={displayName}
                        lastMessage={lastMessageText}
                        timestamp={lastMessage?.createdAt}
                        isActive={pathname.includes(`/chats/${chat.id}`)}
                        otherParticipants={otherParticipants}
                        isDM={isDM}
                        onClick={() => {
                            pendingNavigationRef.current = true;
                            router.push(`/chats/${chat.id}`);
                        }}
                    />
                );
            })}
        </>
    );
}

export default ChatItemsList;
