'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { useSendMessage } from '@/hooks/messages/mutations/use-send-message';
import { Button } from '../ui/button';
import { Loader2, Send } from 'lucide-react';
import { useSocketStore } from '@/hooks/use-socket-store';

const debounce = (func: () => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debounced = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };

    const cancel = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
    };

    return { debounced, cancel };
};

interface MessageInputProps {
    chatId: string;
}

function MessageInput({ chatId }: MessageInputProps) {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { socket } = useSocketStore();

    const stopTyping = useCallback(() => {
        if (socket) {
            socket.emit('typing', { chatId, isTyping: false });
            setIsTyping(false);
        }
    }, [socket, chatId]);

    const debouncedStop = useRef<() => void>(() => {});
    const cancelDebounce = useRef<() => void>(() => {});

    useEffect(() => {
        const { debounced, cancel } = debounce(stopTyping, 2000);
        debouncedStop.current = debounced;
        cancelDebounce.current = cancel;

        return () => {
            cancel();
        };
    }, [stopTyping]);

    const { mutate: mutateSendMessage, isPending: isSendingMessage } = useSendMessage(chatId);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        const msgToSend = input.trim();
        if (!msgToSend) return;

        setInput('');
        mutateSendMessage({ content: msgToSend });
    };

    const handleKeyDown = useCallback(() => {
        if (!isTyping && socket) {
            socket.emit('typing', { chatId, isTyping: true });
            setIsTyping(true);
        }
        debouncedStop.current();
    }, [isTyping, socket, chatId]);

    useEffect(() => {
        const typingTimeout = typingTimeoutRef.current;

        return () => {
            cancelDebounce.current();
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            // Emit stop typing on unmount if currently typing
            if (isTyping && socket) {
                socket.emit('typing', { chatId, isTyping: false });
            }
        };
    }, [isTyping, socket, chatId]);

    if (!socket) return <div>....</div>;

    return (
        <div className="p-4 border-t bg-background">
            <form onSubmit={handleSend} className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={isSendingMessage}
                    onKeyDown={handleKeyDown}
                />
                <Button type="submit" disabled={isSendingMessage || !input.trim()}>
                    {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}

export default MessageInput;
