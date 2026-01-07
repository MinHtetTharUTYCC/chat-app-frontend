'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import { useUpdateTitle } from '@/hooks/chats/mutations/use-update-title';

interface SearchMessageDialogProps {
    chatId: string;
    title: string;
    setChatTitle: (title: string) => void;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    closeSheet: () => void;
}

function UpdateTitleDialog({
    chatId,
    title,
    setChatTitle,
    isOpen,
    setIsOpen,
    closeSheet,
}: SearchMessageDialogProps) {
    const [inputTitle, setInputTitle] = useState(title ?? 'New Group');

    const { mutate: mutateUpdateTitle, isPending: isTitleUpdating } = useUpdateTitle();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={'outline'} size={'icon-sm'} onClick={() => setIsOpen(true)}>
                    <Edit />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>Update Chat Name</DialogTitle>
                    <DialogDescription>Give your group chat a new name</DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Input
                        defaultValue={inputTitle}
                        placeholder="Chat Name"
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
                        onClick={() => {
                            setChatTitle(inputTitle);
                            setIsOpen(false);
                            closeSheet();

                            mutateUpdateTitle(
                                {
                                    title: inputTitle,
                                    chatId,
                                },
                                {
                                    onError: () => {
                                        setInputTitle(title ?? 'New Group');
                                        setChatTitle(title ?? 'New Group');
                                    },
                                }
                            );
                        }}
                        disabled={isTitleUpdating || title === inputTitle.trim()}
                    >
                        <Loader2
                            className={`h-4 w-4 animate-spin ${
                                isTitleUpdating ? 'block' : 'hidden'
                            }`}
                        />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default UpdateTitleDialog;
