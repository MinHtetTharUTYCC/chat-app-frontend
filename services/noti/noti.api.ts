import { api } from '@/lib/api';
import { NotiResponse } from '@/types/notifications';

export const getNotifications = async (cursor?: string): Promise<NotiResponse> => {
    const response = await api.get('/notifications', {
        params: {
            cursor,
            limit: 5,
        },
    });

    return response.data;
};
