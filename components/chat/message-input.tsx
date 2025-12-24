'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { useSendMessage } from '@/hooks/messages/mutations/use-send-message';
import { Button } from '../ui/button';
import { Loader2, Send } from 'lucide-react';
import { useSocketStore } from '@/hooks/use-socket-store';

interface MessageInputProps {
    chatId: string;
}

function MessageInput({ chatId }: MessageInputProps) {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    let typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { socket } = useSocketStore();

    const { mutate: mutateSendMessage, isPending: isSendingMessage } = useSendMessage(
        chatId,
        setInput
    );

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        mutateSendMessage({ content: input.trim() });
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
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
