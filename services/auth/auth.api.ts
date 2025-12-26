import { LoginValues, RegisterValues } from '@/components/auth/validation';
import { api } from '@/lib/api';

export const register = async (values: RegisterValues) => {
    const { data } = await api.post('/auth/register', values);
    return data;
};

export const refresh = async (): Promise<{ accessToken: string }> => {
    const { data } = await api.post('/auth/refresh', null, { withCredentials: true });
    return data;
};

export const login = async (values: LoginValues) => {
    const { data } = await api.post('/auth/login', values);
    return data;
};

export const logout = async () => {
    const { data } = await api.post('/auth/logout', null, { withCredentials: true });
    return data;
};
