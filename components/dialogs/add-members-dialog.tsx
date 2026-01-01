'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/users';
import { useSearchUsersToInvite } from '@/hooks/users/queries/use-search-invite-users';
import UserPickerDialog from './user-picker-dialog';
import { Button } from '../ui/button';
import { UserPlus } from 'lucide-react';
import { useAddMembers } from '@/hooks/users/mutations/use-add-members';

export function AddMembersDialog({ chatId }: { chatId: string }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const { data: searchedUsers = [], isLoading } = useSearchUsersToInvite(chatId, search, open);

    const { mutate: mutateAddMembers, isPending: isAdding } = useAddMembers(chatId);

    const toggleUser = (user: User) => {
        setSelectedUsers((prev) =>
            prev.find((u) => u.id == user.id)
                ? prev.filter((u) => u.id !== user.id)
                : [...prev, user]
        );
    };

    useEffect(() => {
        if (!open) {
            setSelectedUsers([]);
        }
    }, [open, setSelectedUsers]);

    return (
        <>
            <Button variant="outline" size={'sm'} onClick={() => setOpen(true)}>
                <UserPlus />
                Add Members
            </Button>
            <UserPickerDialog
                open={open}
                onOpenChange={setOpen}
                title={'Add Members'}
                confirmLabel={'Add'}
                users={searchedUsers}
                isLoading={isLoading}
                search={search}
                onSearchChange={setSearch}
                selectedUsers={selectedUsers}
                onToggleUser={toggleUser}
                onConfirm={() =>
                    mutateAddMembers(
                        { users: selectedUsers.map((u) => u.id) },
                        {
                            onSuccess: () => {},
                        }
                    )
                }
                isConfirming={isAdding}
            />
        </>
    );
}
