import { getAllUsers } from '@/services/users/user.api';
import { userKeys } from '@/services/users/user.keys';
import { useQuery } from '@tanstack/react-query';

export const useUsers = (open: boolean) => {
    return useQuery({
        queryKey: userKeys.all,
        queryFn: getAllUsers,
        enabled: open,
    });
};
