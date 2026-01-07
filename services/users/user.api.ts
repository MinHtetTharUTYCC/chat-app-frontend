import { api } from '@/lib/api';
import { UsersResponse } from '@/types/users';

export const searchUsers = async (q: string): Promise<UsersResponse> => {
    const { data } = await api.get(`/users/search`, { params: { q } });
    return data;
};
