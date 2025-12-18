import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, MessageCircle } from 'lucide-react';
import { useStartChat } from '@/hooks/chats/mutations/use-start-chat';

interface UserDialogProps {
    user: { id: string; username: string };
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    onDone: () => void;
}
function UserDialog({ user, isOpen, setIsOpen, onDone }: UserDialogProps) {
    const startChatMutation = useStartChat(user.id);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>User Info</DialogTitle>
                </DialogHeader>

                <div className="w-full h-[300px] flex items-center justify-center"></div>

                <DialogFooter>
                    <Button
                        className={`w-full ${
                            startChatMutation.isPending ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        disabled={startChatMutation.isPending}
                        onClick={() =>
                            startChatMutation.mutate(undefined, {
                                onSuccess: () => {
                                    setIsOpen(false);
                                    onDone();
                                },
                            })
                        }
                    >
                        {startChatMutation.isPending ? (
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
