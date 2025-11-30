'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, Edit2, Pin } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface MessageActionsProps {
    chatId: string;
    messageId: string;
    currentContent: string;
    isMe: boolean;
}

export function MessageActions({ chatId, messageId, currentContent, isMe }: MessageActionsProps) {
    const queryClient = useQueryClient();
    const [isEditOpen, setEditOpen] = useState(false);
    const [editContent, setEditContent] = useState(currentContent);

    // DELETE
    const deleteMutation = useMutation({
        mutationFn: () => api.delete(`/chats/${chatId}/messages/${messageId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
            toast.success('Message deleted');
        },
    });

    // EDIT
    const editMutation = useMutation({
        mutationFn: () =>
            api.patch(`/chats/${chatId}/messages/${messageId}`, { content: editContent }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
            setEditOpen(false);
            toast.success('Message updated');
        },
    });

    // PIN
    const pinMutation = useMutation({
        mutationFn: () => api.post(`/chats/${chatId}/messages/${messageId}/pin`),
        onSuccess: () => toast.success('Message pinned'),
    });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isMe ? 'end' : 'start'}>
                    <DropdownMenuItem onClick={() => pinMutation.mutate()}>
                        <Pin className="mr-2 h-4 w-4" /> Pin
                    </DropdownMenuItem>
                    {isMe && (
                        <>
                            <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteMutation.mutate()}
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Message</DialogTitle>
                    </DialogHeader>
                    <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    <DialogFooter>
                        <Button
                            onClick={() => editMutation.mutate()}
                            disabled={editMutation.isPending}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
