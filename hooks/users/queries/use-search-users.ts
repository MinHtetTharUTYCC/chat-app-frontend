import { searchUsers } from '@/services/users/user.api';
import { userKeys } from '@/services/users/user.keys';
import { useQuery } from '@tanstack/react-query';

export const useSearchUsers = (q: string, open: boolean) => {
    return useQuery({
        queryKey: userKeys.search(q),
        queryFn: () => searchUsers(q),
        enabled: open,
    });
};
