'use client';

import { User } from '@/types/users';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Check, Loader2, UserPlus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import UserAvatar from '../user/user-avatar';

type UserPickerDialogProps = {
    open: boolean;
    onOpenChange(open: boolean): void;

    title: string;
    confirmLabel: string;

    users: User[];
    isLoading: boolean;

    search: string;
    onSearchChange(value: string): void;

    selectedUsers: User[];
    onToggleUser(user: User): void;

    onConfirm(): void;
    isConfirming?: boolean;
};
function UserPickerDialog({
    open,
    onOpenChange,
    title,
    confirmLabel,
    users,
    isLoading,
    search,
    onSearchChange,
    selectedUsers,
    onToggleUser,
    onConfirm,
    isConfirming = false,
}: UserPickerDialogProps) {
    useEffect(() => {
        if (!open) onSearchChange('');
    }, [open, onSearchChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">{selectedUsers.length} selected</p>
                    {selectedUsers.length > 0 && (
                        <ScrollArea className="max-h-25">
                            <div className="flex gap-2 flex-wrap">
                                {selectedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="w-fit flex items-center gap-1 p-1 rounded-sm cursor-pointer hover:bg-red-300"
                                        onClick={() => onToggleUser(user)}
                                    >
                                        <span className="w-fit text-sm">{user.username}</span>
                                        <X className="h-4 w-4" />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                    <ScrollArea className="h-56 border rounded-md p-2">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                            users.map((user) => {
                                const isSelected = selectedUsers.some((u) => u.id === user.id);
                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => onToggleUser(user)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onToggleUser(user);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserAvatar username={user.username} size="size-8" />
                                            <span className="flex-1 text-sm font-medium truncate">
                                                {user.username}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <Check className="shrink-0 h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </ScrollArea>{' '}
                    <Button
                        className={`w-full ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={isConfirming || selectedUsers.length === 0}
                        onClick={onConfirm}
                    >
                        {isConfirming ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <UserPlus />
                                {confirmLabel}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default UserPickerDialog;
