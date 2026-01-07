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
import { Plus, Loader2, Check, X, UsersRound } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserDialog from '../user/user-dialog';
import { useCreateGroup } from '@/hooks/chats/mutations/use-create-group';
import { User } from '@/types/users';
import { useSearchUsers } from '@/hooks/users/queries/use-search-users';
import UserAvatar from '../user/user-avatar';

export function CreateChatDialog() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [groupTitle, setGroupTitle] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const [clickedDMUser, setClickedDMUser] = useState<User | null>(null);
    const [isUserOpen, setIsUserOpen] = useState(false);

    const { data: searchedUsers = [], isLoading: isLoadingSearch } = useSearchUsers(search, open);

    const { mutate: mutateCreateGroup, isPending: isCreatingGroup } = useCreateGroup();

    const toggleUser = (user: User) => {
        setSelectedUsers((prev) =>
            prev.find((u) => u.id == user.id)
                ? prev.filter((u) => u.id !== user.id)
                : [...prev, user]
        );
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <Plus className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-150">
                    <DialogHeader>
                        <DialogTitle>Start Chat</DialogTitle>
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
                            />{' '}
                            <ScrollArea className="h-100 border rounded-md p-2">
                                {isLoadingSearch && (
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                )}
                                {searchedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer`}
                                        onClick={() => {
                                            setClickedDMUser(user);
                                            setIsUserOpen(true);
                                        }}
                                    >
                                        <UserAvatar username={user.username} size="size-8" />
                                        <div className="flex-1 text-sm font-medium truncate">
                                            {user.username}
                                        </div>
                                    </div>
                                ))}
                                {searchedUsers && searchedUsers.length < 1 && (
                                    <div className="text-center text-sm text-muted-foreground">
                                        No matched users
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        {/* GROUP VIEW */}
                        <TabsContent value="group" className="space-y-4">
                            <Input
                                placeholder="Group Name"
                                value={groupTitle}
                                onChange={(e) => setGroupTitle(e.target.value.trim())}
                            />
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value.trim())}
                            />

                            <p className="text-sm text-muted-foreground">
                                {selectedUsers.length} members
                            </p>
                            {selectedUsers.length > 0 && (
                                <ScrollArea className="max-h-25">
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="w-fit flex items-center gap-1 p-1 rounded-sm cursor-pointer hover:bg-red-300"
                                                onClick={() => toggleUser(user)}
                                            >
                                                <span className="w-fit text-sm">
                                                    {user.username}
                                                </span>
                                                <X className="h-4 w-4" />
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}

                            <ScrollArea className="h-50 border rounded-md p-2">
                                {/* Reusing search results for selection */}
                                {isLoadingSearch ? (
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                    searchedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                                            onClick={() =>
                                                toggleUser({ id: user.id, username: user.username })
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    username={user.username}
                                                    size="size-8"
                                                />
                                                <span className="flex-1 text-sm font-medium truncate">
                                                    {user.username}
                                                </span>
                                            </div>
                                            {selectedUsers.find((u) => u.id == user.id) && (
                                                <Check className="shrink-0 h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                            <Button
                                className={`w-full ${
                                    isCreatingGroup ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                disabled={!groupTitle || selectedUsers.length === 0}
                                onClick={() =>
                                    mutateCreateGroup(
                                        {
                                            groupTitle: groupTitle.trim(),
                                            userIds: selectedUsers.map((u) => u.id),
                                        },
                                        {
                                            onSuccess: () => {
                                                setOpen(false);
                                            },
                                        }
                                    )
                                }
                            >
                                {isCreatingGroup ? (
                                    <Loader2 className={`h-4 w-4 animate-spin`} />
                                ) : (
                                    <UsersRound className={`h-4 w-4 `} />
                                )}
                                Create Group
                            </Button>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
            {clickedDMUser && (
                <UserDialog
                    user={clickedDMUser}
                    isOpen={isUserOpen}
                    setIsOpen={(val) => {
                        setIsUserOpen(val);
                        if (!val) {
                            setClickedDMUser(null);
                        }
                    }}
                    onDone={() => setOpen(false)}
                />
            )}
        </>
    );
}
