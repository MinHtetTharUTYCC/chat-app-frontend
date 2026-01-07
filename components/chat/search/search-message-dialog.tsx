'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search } from 'lucide-react';
import { MessageBubble } from '../message-bubble';
import { useAuthStore } from '@/hooks/use-auth-store';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/search/use-debounce';
import { Button } from '@/components/ui/button';
import { useSearchMessages } from '@/hooks/messages/queries/use-search-messages';

interface SearchMessageDialogProps {
    chatId: string;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    closeSheet: () => void;
}

function SarchMessageDialog({ isOpen, setIsOpen, chatId, closeSheet }: SearchMessageDialogProps) {
    const router = useRouter();

    const currentUser = useAuthStore((store) => store.currentUser);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    const {
        data: messages = [],
        isLoading,
        error,
    } = useSearchMessages(isOpen, chatId, debouncedSearch);

    const handleMsgClick = (messageId: string) => {
        const params = new URLSearchParams();
        params.set('messageId', messageId);
        setIsOpen(false);
        closeSheet();
        router.replace(`/chats/${chatId}?${params.toString()}`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={'outline'} size={'icon-sm'} onClick={() => setIsOpen(true)}>
                    <Search />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>Search Messages</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Type here..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <ScrollArea className="h-100 border rounded-md p-2">
                        {isLoading && (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="animate-spin" />
                            </div>
                        )}

                        {!isLoading && messages.length === 0 && (
                            <p className="text-center p-4">No message found</p>
                        )}

                        {error && <div className="text-center p-4">Something went wrong</div>}

                        {!isLoading && messages.length >= 1 && (
                            <div>
                                <p className="text-center p-4">{messages.length} results found</p>
                                {[...messages].reverse().map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            'group flex gap-2 items-center',
                                            msg.senderId === currentUser?.id
                                                ? 'flex-row-reverse'
                                                : 'flex-row'
                                        )}
                                    >
                                        <MessageBubble
                                            key={msg.id}
                                            msgId={msg.id}
                                            content={msg.content}
                                            createdAt={msg.createdAt}
                                            isMe={msg.senderId === currentUser?.id}
                                            senderName={msg.sender?.username}
                                            isOptimistic={false}
                                            highlightText={debouncedSearch}
                                            onMsgClick={() => handleMsgClick(msg.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default SarchMessageDialog;
