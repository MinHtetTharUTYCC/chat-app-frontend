'use client';

import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Users, Lock, UserPlus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChatDetailsResponse } from '@/types/chats';
import { api } from '@/lib/api';

interface GroupChatPreviewProps {
    chatDetails: ChatDetailsResponse;
}

export function GroupChatPreview({ chatDetails }: GroupChatPreviewProps) {
    const queryClient = useQueryClient();

    // TODO: Implement join group mutation
    const joinGroupMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post(`/chats/${chatDetails.id}/join`);
            return data;
        },
        onSuccess: () => {
            toast.success('Joined group successfully!');
            // Invalidate and refetch chat details
            queryClient.invalidateQueries({ queryKey: ['chat', chatDetails.id] });
            queryClient.invalidateQueries({ queryKey: ['messages', chatDetails.id] });
        },
    });

    const memberCount = chatDetails.participantsCount || chatDetails.participants?.length || 0;

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full space-y-6 text-center">
                {/* Group Avatar */}
                <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl">
                            <Users className="h-12 w-12" />
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Group Info */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{chatDetails.title || 'Group Chat'}</h2>
                    <p className="text-muted-foreground flex items-center justify-center gap-2">
                        <Users className="h-4 w-4" />
                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </p>
                </div>

                {/* Preview Members */}
                {chatDetails.participants && chatDetails.participants.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Members</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {chatDetails.participants.slice(0, 5).map((participant) => (
                                <div
                                    key={participant.user.id}
                                    className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full"
                                >
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="text-xs">
                                            {participant.user.username
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{participant.user.username}</span>
                                </div>
                            ))}
                            {chatDetails.participants.length > 5 && (
                                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                                    <span className="text-sm text-muted-foreground">
                                        +{chatDetails.participants.length - 5} more
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Join Button */}
                <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => joinGroupMutation.mutate()}
                    disabled={joinGroupMutation.isPending}
                >
                    <UserPlus className="h-5 w-5" />
                    {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                </Button>

                <p className="text-xs text-muted-foreground">
                    You'll be able to see all messages after joining
                </p>
            </div>
        </div>
    );
}
