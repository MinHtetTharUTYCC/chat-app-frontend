'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, Edit2, Pin } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEditMessage } from '@/hooks/messages/mutations/use-edit-message';
import { useDeleteMessage } from '@/hooks/messages/mutations/use-delete-message';
import { usePinMessage } from '@/hooks/messages/mutations/use-pin-message';
import { useUnpinMessage } from '@/hooks/messages/mutations/use-unpin-message';

interface MessageActionsProps {
    chatId: string;
    messageId: string;
    msgSenderId: string;
    currentContent: string;
    isMe: boolean;
    isPinned: boolean;
    canUnpin: boolean;
}

export function MessageActions({
    chatId,
    messageId,
    msgSenderId,
    currentContent,
    isMe,
    isPinned,
    canUnpin,
}: MessageActionsProps) {
    const [isEditOpen, setEditOpen] = useState(false);
    const [editContent, setEditContent] = useState(currentContent);

    // edit
    const { mutate: mutateEdit, isPending: isPendingEdit } = useEditMessage(chatId);
    // delete
    const { mutate: mutateDeleteMessage, isPending: isPendingDelete } = useDeleteMessage(chatId);
    // pin
    const { mutate: mutatePinMessage, isPending: isPendingPin } = usePinMessage(chatId);
    // unpin
    const { mutate: mutateUnpinMessage, isPending: isPendingUnpin } = useUnpinMessage(chatId);

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
                    {canUnpin && (
                        <DropdownMenuItem
                            onClick={() => mutateUnpinMessage({ messageId })}
                            disabled={isPendingPin || isPendingUnpin}
                        >
                            <Pin className="mr-2 h-4 w-4" /> Unpin
                        </DropdownMenuItem>
                    )}
                    {!isPinned && (
                        <DropdownMenuItem
                            onClick={() =>
                                mutatePinMessage({
                                    messageId,
                                    content: currentContent,
                                    msgSenderId: msgSenderId,
                                })
                            }
                            disabled={isPendingPin || isPendingUnpin}
                        >
                            <Pin className="mr-2 h-4 w-4" /> Pin
                        </DropdownMenuItem>
                    )}
                    {isMe && (
                        <>
                            <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => mutateDeleteMessage({ messageId })}
                                disabled={isPendingDelete}
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
                            onClick={() => {
                                setEditOpen(false);
                                mutateEdit({ messageId, content: editContent });
                            }}
                            disabled={isPendingEdit}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
