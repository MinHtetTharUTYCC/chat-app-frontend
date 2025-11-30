'use client';

import { ChatWindow } from '@/components/chat/chat-window';
import { useParams } from 'next/navigation';

export default function ChatPage() {
    const params = useParams<{ chatId: string }>();
    const chatId = params.chatId;

    return <ChatWindow chatId={chatId} />;
}

ChatPage;
