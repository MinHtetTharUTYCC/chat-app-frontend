'use client';

import { useState } from 'react';
import { User } from '@/types/users';
import { useSearchUsersToInvite } from '@/hooks/users/queries/use-search-invite-users';
import { useInvite } from '@/hooks/users/mutations/use-invite';
import UserPickerDialog from './user-picker-dialog';
import { Button } from '../ui/button';
import { UserPlus } from 'lucide-react';

export function InviteUserDialog({ chatId }: { chatId: string }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const { data: searchedUsers = [], isLoading } = useSearchUsersToInvite(chatId, search, open);

    const { mutate: mutateInvite, isPending: isInviting } = useInvite(chatId);

    const toggleUser = (user: User) => {
        setSelectedUsers((prev) =>
            prev.find((u) => u.id === user.id)
                ? prev.filter((u) => u.id !== user.id)
                : [...prev, user]
        );
    };

    return (
        <>
            <Button variant="outline" size={'sm'} onClick={() => setOpen(true)}>
                <UserPlus />
                Invite Members
            </Button>
            <UserPickerDialog
                open={open}
                onOpenChange={(isOpen) => {
                    setOpen(isOpen);
                    if (!isOpen) {
                        setSelectedUsers([]);
                    }
                }}
                title={'Invite Members'}
                confirmLabel={'Invite'}
                users={searchedUsers}
                isLoading={isLoading}
                search={search}
                onSearchChange={setSearch}
                selectedUsers={selectedUsers}
                onToggleUser={toggleUser}
                onConfirm={() =>
                    mutateInvite(
                        { users: selectedUsers.map((u) => u.id) },
                        {
                            onSuccess: () => {
                                setOpen(false);
                            },
                        }
                    )
                }
                isConfirming={isInviting}
            />
        </>
    );
}
