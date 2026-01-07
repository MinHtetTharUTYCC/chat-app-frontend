'use client';

import { ChatWindow } from '@/components/chat/chat-window';
import { useParams, useSearchParams } from 'next/navigation';

export default function ChatPage() {
    const params = useParams<{ chatId: string }>();
    const searchParams = useSearchParams();

    const chatId = params.chatId;
    const messageId = searchParams.get('messageId') || undefined;
    const date = searchParams.get('date') || undefined;

    return <ChatWindow chatId={chatId} messageId={messageId} date={date} />;
}
