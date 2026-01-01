import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, MessageCircle } from 'lucide-react';
import { useStartChat } from '@/hooks/chats/mutations/use-start-chat';
import UserAvatar from './user-avatar';

interface UserDialogProps {
    user: { id: string; username: string };
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    onDone: () => void;
}
function UserDialog({ user, isOpen, setIsOpen, onDone }: UserDialogProps) {
    const { mutate: mutateStartChat, isPending } = useStartChat(user.id);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>{user.username}</DialogTitle>
                </DialogHeader>

                <div className="w-full h-75 flex flex-col items-center justify-center">
                    <UserAvatar username={user.username} size="size-40" />
                    <p className="font-semibold text-2xl">{user.username}</p>
                </div>

                <DialogFooter>
                    <Button
                        className={`w-full ${isPending ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={isPending}
                        onClick={() => {
                            mutateStartChat(undefined, {
                                onSuccess: () => {
                                    setIsOpen(false);
                                    onDone();
                                },
                            });
                        }}
                    >
                        {isPending ? (
                            <Loader2 className={`h-4 w-4 animate-spin`} />
                        ) : (
                            <MessageCircle className={`h-4 w-4 `} />
                        )}
                        Start Chat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default UserDialog;
