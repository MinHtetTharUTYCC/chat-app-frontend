'use client';

import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MessageBubble } from './message-bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageActions } from './message-actions';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useSocketStore } from '@/hooks/use-socket-store';
import ChatHeader from './chat-header';

interface ChatWindowProps {
    chatId: string;
}

export function ChatWindow(props: ChatWindowProps) {
    const { currentUser } = useAuthStore();
    const { socket } = useSocketStore();

    const { chatId } = props;

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const autoLoadRef = useRef<HTMLDivElement | null>(null);
    const queryClient = useQueryClient();

    // Fetch Messages with Cursor Pagination
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['messages', chatId],
        queryFn: async ({ pageParam = undefined }) => {
            if (!chatId) return [];
            const res = await api.get(`/chats/${chatId}/messages`, {
                params: { cursor: pageParam, limit: 20 },
            });
            console.log('Fetched messages data:', res.data);
            return res.data; // { data: [], meta: { nextCursor: '', hasMore: true }
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
            console.log('Last Page:', lastPage);
            return lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined;
        },
        enabled: !!chatId,
    });

    // Mutation for Sending
    const sendMessage = useMutation({
        mutationFn: async (content: string) => {
            return api.post(`/chats/${chatId}/messages`, { content });
        },
        onSuccess: () => {
            setInput('');
            queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
            queryClient.invalidateQueries({ queryKey: ['chats'] }); // Refresh sidebar order
        },
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage.mutate(input);
    };

    useEffect(() => {
        if (!socket || !chatId) return;
        const handleNewMessage = (newMessage: any) => {
            // ignore messages not for this chat or sent by self(optimistic update at sender side)
            if (newMessage.chatId !== chatId || newMessage.senderId === currentUser?.id) return;

            queryClient.setQueryData(['messages', chatId], (oldData: any) => {
                if (!oldData) return oldData;

                const firstPage = oldData.pages[0];
                const updatedFirstPage = {
                    ...firstPage,
                    data: [newMessage, ...firstPage.data],
                };
                return {
                    ...oldData,
                    pages: [updatedFirstPage, ...oldData.pages.slice(1)],
                };
            });
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, chatId]);

    // Scroll to bottom on initial load
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'instant' });
        }
    }, [chatId, data?.pages[0]]); // Naive scroll implementation

    useEffect(() => {
        const el = autoLoadRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!el) return;

        const hanldeScorll = () => {
            if (el.scrollTop <= 0 && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        };

        el.addEventListener('scroll', hanldeScorll);
        return () => el.removeEventListener('scroll', hanldeScorll);
    }, [hasNextPage, isFetchingNextPage]);

    // Flatten pages for rendering
    const messages =
        data?.pages
            .flatMap((page: any) => (Array.isArray(page) ? page : page.data || []))
            .reverse() || [];

    if (!chatId) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a chat to start messaging
            </div>
        );
    }

    if (!socket) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Connecting to chat...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-auto">
            {/* Header */}
            <ChatHeader chatId={chatId} />

            {/* Messages Area */}
            <ScrollArea ref={autoLoadRef} className="h-[600px] p-4">
                {isFetchingNextPage && (
                    <div className="flex items-center justify-center p-2">
                        <Button
                            variant={'ghost'}
                            disabled={true}
                            size={'sm'}
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={'3px'} />
                            <p>loading older messages...</p>
                        </Button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    messages.map((msg: any) => (
                        <div
                            key={msg.id}
                            className={cn(
                                'group flex gap-2 items-end',
                                msg.senderId === currentUser?.id ? 'flex-row-reverse' : 'flex-row'
                            )}
                        >
                            <MessageBubble
                                key={msg.id}
                                content={msg.content}
                                createdAt={msg.createdAt}
                                isMe={msg.senderId === currentUser?.id}
                                senderName={msg.sender?.username}
                            />
                            <MessageActions
                                chatId={chatId}
                                messageId={msg.id}
                                currentContent={msg.content}
                                isMe={msg.senderId === currentUser?.id}
                            />
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={sendMessage.isPending}
                    />
                    <Button type="submit" disabled={sendMessage.isPending || !input.trim()}>
                        {sendMessage.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
