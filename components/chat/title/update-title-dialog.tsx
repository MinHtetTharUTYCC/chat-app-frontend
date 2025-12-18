'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface SearchMessageDialogProps {
    chatId: string;
    title: string;
    setChatTitle: (title: string) => void;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    closeSheet: () => void;
}
interface UpdateTitleContext {
    prevChat: any;
    prevChatsList: any;
}

function UpdateTitleDialog({
    chatId,
    title,
    setChatTitle,
    isOpen,
    setIsOpen,
    closeSheet,
}: SearchMessageDialogProps) {
    const queryClient = useQueryClient();

    const [inputTitle, setInputTitle] = useState(title ?? 'New Group');

    useEffect(()=>{
        setInputTitle(title ?? 'New Group')
    },[isOpen])

    const updateChatTitleMutation = useMutation({
        mutationFn: () => api.patch(`/chats/${chatId}/update-title`, { title: inputTitle }),
        onMutate: async () => {
            //cancel ongoing queries
            await queryClient.cancelQueries({ queryKey: ['chat', chatId] });
            await queryClient.cancelQueries({ queryKey: ['chats'] });

            //snapshop prev values
            const prevChat = queryClient.getQueryData(['chat', chatId]);
            const prevChatsList = queryClient.getQueryData(['chats']);

            //optimistic update
            queryClient.setQueryData(['chat', chatId], (old: any) => ({
                ...old,
                title: inputTitle,
            }));
            queryClient.setQueryData(['chats'], (old: any) => {
                if (!old) return old;
                return old.map((chat: any) =>
                    chat.id === chatId ? { ...chat, title: inputTitle } : chat
                );
            });

            setChatTitle(inputTitle);

            return { prevChat, prevChatsList };
        },
        onSuccess: () => {
            toast.success('Group name updated successfully');
            setIsOpen(false);
            closeSheet();
        },
        onError: (err, content, context: UpdateTitleContext | undefined) => {
            //rollback
            if (context?.prevChat) {
                queryClient.setQueryData(['chat', chatId], context.prevChat);
                setChatTitle(context.prevChat.title);
            }
            if (context?.prevChatsList) {
                queryClient.setQueryData(['chats'], context.prevChatsList);
            }

            console.error('Failed to update title: ', err);
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className="w-full flex items-center justify-center p-2 cursor-pointer"
                    onClick={() => setIsOpen(true)}
                >
                    <Edit className="h-5 w-5" />
                    Edit Chat Name
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Update Chat Name</DialogTitle>
                    <DialogDescription>Give your group chat a new name</DialogDescription>
                </DialogHeader>

                <div className='space-y-2'>
                    <Input
                        defaultValue={inputTitle}
                        placeholder='Chat Name'
                        onChange={(e) => setInputTitle(e.currentTarget.value.trim())}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild onClick={() => setIsOpen(false)}>
                        <Button variant="outline" size={'sm'}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => updateChatTitleMutation.mutate()}
                        disabled={updateChatTitleMutation.isPending || title === inputTitle.trim()}
                    >
                        {updateChatTitleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default UpdateTitleDialog;
