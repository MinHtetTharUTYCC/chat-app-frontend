import { api } from '@/lib/api';
import { NotiResponse } from '@/types/notifications';

export const getNotifications = async (
    cursor?: string,
    limit: number = 5
): Promise<NotiResponse> => {
    const response = await api.get('/notifications', {
        params: {
            cursor,
            limit,
        },
    });

    return response.data;
};
