'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAppStore } from '@/hooks/use-app-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CreateChatDialog() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [groupTitle, setGroupTitle] = useState('');
    const queryClient = useQueryClient();
    const { setActiveChatId } = useAppStore();

    // 1. Search Users (Global Search)
    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['search', search],
        queryFn: async () => {
            if (!search) return [];
            // Assuming your backend supports ?q= query param for this endpoint,
            // otherwise fetch all friends via /presence/friends
            const res = await api.get(`/search?q=${search}`);
            return res.data; // Expecting User[]
        },
        enabled: search.length > 1,
    });

    // 2. Start DM Mutation
    const startChatMutation = useMutation({
        mutationFn: async (userId: string) => api.post('/chats/start', { otherUserId: userId }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setActiveChatId(res.data.id);
            setOpen(false);
            toast.success('Chat started');
        },
    });

    // 3. Create Group Mutation
    const createGroupMutation = useMutation({
        mutationFn: async () =>
            api.post('/chats/create-group', { title: groupTitle, userIds: selectedUsers }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setActiveChatId(res.data.id);
            setOpen(false);
            toast.success('Group created');
        },
    });

    const toggleUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="dm" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dm">Direct Message</TabsTrigger>
                        <TabsTrigger value="group">Group Chat</TabsTrigger>
                    </TabsList>

                    {/* DM VIEW */}
                    <TabsContent value="dm" className="space-y-4">
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin mx-auto" />}
                            {searchResults?.map((user: any) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                                    onClick={() => startChatMutation.mutate(user.id)}
                                >
                                    <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm font-medium">{user.username}</div>
                                </div>
                            ))}
                        </ScrollArea>
                    </TabsContent>

                    {/* GROUP VIEW */}
                    <TabsContent value="group" className="space-y-4">
                        <Input
                            placeholder="Group Name"
                            value={groupTitle}
                            onChange={(e) => setGroupTitle(e.target.value)}
                        />
                        <Input
                            placeholder="Search users to add..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {/* Reusing search results for selection */}
                            {searchResults?.map((user: any) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                                    onClick={() => toggleUser(user.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{user.username[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{user.username}</span>
                                    </div>
                                    {selectedUsers.includes(user.id) && (
                                        <Check className="h-4 w-4 text-green-500" />
                                    )}
                                </div>
                            ))}
                        </ScrollArea>
                        <Button
                            className="w-full"
                            disabled={!groupTitle || selectedUsers.length === 0}
                            onClick={() => createGroupMutation.mutate()}
                        >
                            Create Group
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
