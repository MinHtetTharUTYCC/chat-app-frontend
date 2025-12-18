'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './message-bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Circle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageActions } from './message-actions';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useSocketStore } from '@/hooks/use-socket-store';
import ChatHeader from './chat-header';
import { useSendMessage } from '@/hooks/chats/mutations/use-send-message';
import { useTypingSound } from '@/hooks/sound/use-typing-sound';
import { UseMessages } from '@/hooks/messages/queries/use-messages';

interface ChatWindowProps {
    chatId: string;
    messageId?: string;
    date?: string;
}

export function ChatWindow({ chatId, messageId, date }: ChatWindowProps) {
    const { currentUser } = useAuthStore();
    const { socket } = useSocketStore();

    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const hasScrolledToBottomInitiallyRef = useRef(false);

    const isInMiddle = !!messageId || !!date;
    const hasScrolledToMiddleRef = useRef(false);
    const prevScrollHeightRef = useRef<number>(0); //for up
    const prevScrollTopRef = useRef<number>(0); //for down

    let typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isTyping, setIsTyping] = useState(false); //ME
    const [isOtherTyping, setIsOtherTyping] = useState(false); //other user
    useTypingSound(isOtherTyping);

    // Fetch Messages with Cursor Pagination
    const {
        data,
        fetchNextPage, //older msgs
        fetchPreviousPage, //newer msgs
        hasNextPage,
        hasPreviousPage,
        isFetchingNextPage,
        isFetchingPreviousPage,
        isLoading,
    } = UseMessages({ chatId, jumpToMessageId: messageId, jumpToDate: date });
    // initially auto-scroll to position(message/date) or bottom(default)
    useEffect(() => {
        if (data?.pages[0]) {
            if (isInMiddle) {
                if (hasScrolledToMiddleRef.current !== true) {
                    if (messageId) {
                        // wait for brower paint
                        requestAnimationFrame(() => {
                            const anchorElement = document.getElementById(`message-${messageId}`);
                            if (anchorElement) {
                                anchorElement.scrollIntoView({
                                    behavior: 'instant',
                                    block: 'center',
                                });

                                //highlight
                                anchorElement?.classList.add('bg-yellow-400');
                                setTimeout(() => {
                                    anchorElement.classList.remove('bg-yellow-400');
                                }, 2000);

                                hasScrolledToMiddleRef.current = true;
                            }
                        });
                    } else if (date) {
                        //TODO: handle date scroll
                    }
                }
            } else if (bottomRef.current) {
                // Normal load - scroll to bottom
                console.log('CALLED: SCRL BTMMMM');
                bottomRef.current.scrollIntoView({ behavior: 'instant' });
                hasScrolledToBottomInitiallyRef.current = true;
            }
        }
    }, [isInMiddle, data?.pages[0]]);

    useEffect(() => {
        const el = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!el) return;

        const handleManualScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = el as HTMLDivElement;

            const isInitialScrollDone =
                hasScrolledToMiddleRef.current === true ||
                hasScrolledToBottomInitiallyRef.current === true;

            if (!isInitialScrollDone) {
                console.log('Waiting for initial scroll to complete...');
                return; // Exit early
            }


            // Load OLDER messages (scroll upward)
            if (el.scrollTop <= 10 && hasNextPage && !isFetchingNextPage) {
                console.log('⬆️ Loading older messages...');
                fetchNextPage();
            }

            /// Load NEWER messages (scroll downward)
            if (
                scrollTop + clientHeight >= scrollHeight - 10 &&
                hasPreviousPage &&
                !isFetchingPreviousPage &&
                isInMiddle
            ) {
                console.log('⬇️ Loading newer messages...');
                fetchPreviousPage();
            }
        };

        el.addEventListener('scroll', handleManualScroll);
        return () => el.removeEventListener('scroll', handleManualScroll);
    }, [
        fetchNextPage,
        fetchPreviousPage,
        hasNextPage,
        hasPreviousPage,
        isFetchingNextPage,
        isFetchingPreviousPage,
        hasScrolledToBottomInitiallyRef,
        hasScrolledToMiddleRef,
    ]);

    // Mutation for Sending
    const sendMessageMutation = useSendMessage(chatId, setInput);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessageMutation.mutate(input.trim());
    };

    useEffect(() => {
        if (!socket || !chatId) return;

        const handleUserTyping = (typingDetails: any) => {
            if (typingDetails.chatId === chatId) {
                setIsOtherTyping(typingDetails.isTyping);
            }
        };

        socket.on('user_typing', handleUserTyping);

        return () => {
            socket.off('user_typing', handleUserTyping);
        };
    }, [socket, chatId]);

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        const el = viewport as HTMLDivElement | null;
        if (!el) return;

        if (isFetchingNextPage) {
            // Store before fetch
            prevScrollHeightRef.current = el.scrollHeight;
        } else if (prevScrollHeightRef.current > 0) {
            // Restore after fetch completes
            const heightDiff = el.scrollHeight - prevScrollHeightRef.current;
            console.log(el.scrollHeight,prevScrollHeightRef.current,heightDiff)
            el.scrollTop = el.scrollTop + heightDiff;
            prevScrollHeightRef.current = 0;
        }
    }, [isFetchingNextPage]);

    useEffect(() => {
        hasScrolledToMiddleRef.current = false;
        prevScrollHeightRef.current = 0;
        prevScrollTopRef.current = 0;
    }, [messageId]);
    useEffect(() => {
        hasScrolledToBottomInitiallyRef.current = false;
        hasScrolledToMiddleRef.current = false;
    }, [chatId]);

    // Flatten pages
    const messages =
        data?.pages
            .slice() //shalow copy(without mutating the array) [[msg9,msg10],[msg7,msg8]]
            .reverse() //reverse => [[msg7,msg8],[msg9,msg10]]
            .flatMap((page) => page.messages) || [];

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
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <ChatHeader chatId={chatId} />

            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-auto">
                {isFetchingNextPage && (
                    <div className="flex items-center justify-center p-2">
                        <Button
                            variant={'ghost'}
                            disabled={true}
                            size={'sm'}
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={'3px'} />
                            <p>Loading older messages...</p>
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
                                'group flex gap-2 items-center',
                                msg.senderId === currentUser?.id ? 'flex-row-reverse' : 'flex-row'
                            )}
                        >
                            <MessageBubble
                                key={msg.id}
                                msgId={msg.id}
                                content={msg.content}
                                createdAt={msg.createdAt}
                                isMe={msg.senderId === currentUser?.id}
                                senderName={msg.sender?.username}
                                isOptimistic={
                                    msg._optimistic || msg.id.toString().startsWith('temp-')
                                }
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

                {isFetchingPreviousPage && (
                    <div className="flex items-center justify-center p-2">
                        <Button
                            variant={'ghost'}
                            disabled={true}
                            size={'sm'}
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={'3px'} />
                            <p>Loading newer messages...</p>
                        </Button>
                    </div>
                )}
                <div ref={bottomRef} />
                {isOtherTyping && (
                    <div className="flex items-end gap-1 ml-6 my-2">
                        <Circle className="w-2 h-2 animate-bounce [animation-delay:-200ms]" />
                        <Circle className="w-2 h-2 animate-bounce [animation-delay:-100ms]" />
                        <Circle className="w-2 h-2 animate-bounce" />
                    </div>
                )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={sendMessageMutation.isPending}
                        onKeyDown={() => {
                            if (!isTyping) {
                                socket.emit('typing', { chatId, isTyping: true });
                                setIsTyping(true);
                            }

                            //clear prev timeOut
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                            }

                            //set a new timeout to stop typing after 2 sec of inactivity
                            typingTimeoutRef.current = setTimeout(() => {
                                socket.emit('typing', { chatId, isTyping: false });
                                setIsTyping(false);
                            }, 2000);
                        }}
                    />
                    <Button type="submit" disabled={sendMessageMutation.isPending || !input.trim()}>
                        {sendMessageMutation.isPending ? (
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
