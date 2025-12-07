'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { ChatItem } from './chat-item';
import { useAppStore } from '@/hooks/use-app-store';
import { usePathname, useRouter } from 'next/navigation';

function ChatItemsList({ chats }: { chats: any[] }) {
    const pathname = usePathname();
    const router = useRouter();

    const { currentUser } = useAuthStore();
    const { setChatsOpen } = useAppStore();

    return (
        <div className="w-full">
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
                            router.push(`/chats/${chat.id}`);
                            setChatsOpen(false);
                        }}
                    />
                );
            })}
        </div>
    );
}

export default ChatItemsList;
