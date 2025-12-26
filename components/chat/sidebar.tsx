'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateChatDialog } from './create-chat-dialog';
import { NotificationPopover } from '../notifications/notification-popover';
import UserNav from '../user-nav';
import { usePathname, useRouter } from 'next/navigation';
import { ModeToggle } from '../mode-toggle';
import { useEffect, useMemo } from 'react';
import { usePresenceStore } from '@/hooks/use-presence-store';
import ChatItemsList from './chat-items-list';
import { useChats } from '@/hooks/chats';
import { useAllPresense } from '@/hooks/presence/queries/use-all-presence';

export function ChatSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const bulkUpdatePresence = usePresenceStore((state) => state.bulkUpdatePresence);

    const { data: chats, isLoading } = useChats();

    useEffect(() => {
        if (!isLoading && chats && chats.length > 0) {
            if (pathname === '/chats') {
                router.replace(`/chats/${chats[0].id}`);
            }
        }
    }, [isLoading, chats, pathname, router]);

    const allUserIds = useMemo(() => {
        if (!chats) return [];

        const ids = new Set<string>();
        chats.forEach((chat: any) => {
            chat.participants.forEach((p: any) => {
                ids.add(p.userId);
            });
        });

        return Array.from(ids);
    }, [chats]);

    // Fetch presence for all users at once
    const { data: presenceData } = useAllPresense(allUserIds);
    // Update store when data arrives
    useEffect(() => {
        if (presenceData && typeof presenceData === 'object') {
            bulkUpdatePresence(presenceData);
        }
    }, [presenceData, bulkUpdatePresence]);

    return (
        <div className="w-full flex flex-col h-screen border-r bg-background">
            {/* Header */}
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Messages</h2>
                    <div className="flex gap-1">
                        <NotificationPopover />
                        <CreateChatDialog />
                        <ModeToggle />
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search chats..." className="pl-8" />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 min-h-0">
                <ScrollArea className="h-full p-2">
                    {!isLoading && chats && <ChatItemsList chats={chats} />}
                    {isLoading &&
                        Array.from({ length: 50 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full mb-2" />
                        ))}
                </ScrollArea>
            </div>

            {/* Bottom User Bar */}
            <div className="p-4 border-t flex items-center justify-between">
                <UserNav />
            </div>
        </div>
    );
}
