import { api } from '@/lib/api';
import { UsersResponse } from '@/types/users';

export const getAllUsers = async (): Promise<UsersResponse> => {
    const { data } = await api.get(`/users`);
    return data;
};

export const searchUsers = async (q: string): Promise<UsersResponse> => {
    const { data } = await api.get(`/users/search?q=${q}`);
    return data;
};
