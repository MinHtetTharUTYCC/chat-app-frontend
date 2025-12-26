'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import UserAvatar from './user/user-avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Button } from './ui/button';
import { LogOut, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { logout } from '@/services/auth/auth.api';
import { useRouter } from 'next/navigation';

function UserNav() {
    const router = useRouter();
    const { currentUser, logout: resetAuth } = useAuthStore();

    const handleLogout = async () => {
        try {
            await logout();
            resetAuth();

            toast.success('Logout successfully');
            router.push('/login');
        } catch (error) {
            const message = 'Logout failed';
            console.error(message);
            toast.error(message);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <UserAvatar username={currentUser.username} size={10} />
                <p>{currentUser.username}</p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={'outline'} size={'icon-sm'} className="rounded-full">
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleLogout} variant="destructive">
                        <LogOut />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default UserNav;
