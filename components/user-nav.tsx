'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import UserAvatar from './user/user-avatar';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { logout } from '@/services/auth/auth.api';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

function UserNav() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { currentUser, logout: resetAuth } = useAuthStore();

    const handleLogout = async () => {
        try {
            await logout();
            resetAuth();
            queryClient.clear();

            toast.success('Logged out successfully');
            router.replace('/login');
        } catch (error) {
            const message = 'Logout failed';
            console.error(message, error);
            toast.error(message);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <UserAvatar username={currentUser.username} size={'size-10'} />
                <p>{currentUser.username}</p>
            </div>
            <Button variant={'destructive'} size={'icon-sm'} onClick={handleLogout}>
                <LogOut />
            </Button>
        </div>
    );
}

export default UserNav;
