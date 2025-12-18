import { api } from '@/lib/api';
import { PresenceResponse } from '@/types/types';

export const getPresenceAll = async (allUserIds: string[]): Promise<PresenceResponse> => {
    if (allUserIds.length === 0) return {};
    const { data } = await api.post('/presence/bulk', { userIds: allUserIds });
    return data;
};
