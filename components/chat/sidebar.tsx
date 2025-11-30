'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatItem } from './chat-item';
import { useAppStore } from '@/hooks/use-app-store';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateChatDialog } from './create-chat-dialog'; // Import
import { NotificationPopover } from './notification-popover'; // Import
import UserNav from '../user-nav';
import { redirect, usePathname, useRouter } from 'next/navigation';

import { ModeToggle } from '../mode-toggle';
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';

export function ChatSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const { setChatsOpen } = useAppStore();
    const { currentUser } = useAuthStore();

    const { data: chats, isLoading } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => {
            // Fetch chats
            const res = await api.get('/chats');
            return res.data;
        },
    });

    // Fetch Presence data to merge with chats
    const { data: onlineFriends } = useQuery({
        queryKey: ['presence'],
        queryFn: async () => (await api.get('/presence/friends')).data,
    });

    useEffect(() => {
        if (!isLoading && chats && chats.length > 0) {
            if (pathname === '/chats') {
                router.replace(`/chats/${chats[0].id}`);
            }
        }
    }, [isLoading, chats, pathname, router]);

    return (
        <div className="flex flex-col h-full border-r bg-background">
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
            <ScrollArea className="flex-1 p-2">
                {isLoading
                    ? Array.from({ length: 50 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full mb-2" />
                      ))
                    : chats?.map((chat: any) => {
                          // Determine if online (simple logic for DM)
                          // Assuming chat.participants is array. Find the one that isn't me.
                          // Then check if their ID exists in onlineFriends
                          const isOnline = onlineFriends?.some((f: any) =>
                              chat.participants.some((p: any) => p.id === f.id)
                          );

                          const otherParticipant = chat.participants.find(
                              (parti: any) => parti.userId != currentUser?.id
                          );

                          const lastMessage = chat.messages[0];

                          return (
                              <ChatItem
                                  key={chat.id}
                                  id={chat.id}
                                  name={
                                      chat.isGroup
                                          ? chat.title || 'Group Chat'
                                          : otherParticipant.user.username || 'Unknow User'
                                  }
                                  lastMessage={
                                      lastMessage.senderId == currentUser?.id
                                          ? `You: ${lastMessage.content}`
                                          : lastMessage.content || 'No messages yet'
                                  }
                                  timestamp={chat.lastMessage?.createdAt}
                                  isActive={pathname.includes(`/chats/${chat.id}`)}
                                  onClick={() => {
                                      router.push(`/chats/${chat.id}`);
                                      setChatsOpen(false);
                                  }}
                                  isOnline={!!isOnline}
                              />
                          );
                      })}
            </ScrollArea>

            {/* Bottom User Bar */}
            <div className="p-4 border-t flex items-center justify-between">
                {/* Could put User Settings + Logout */}
                <UserNav />
            </div>
        </div>
    );
}
