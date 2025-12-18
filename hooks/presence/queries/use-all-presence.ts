'use client';

import { getPresenceAll } from '@/services/presence/presence.api';
import { presenceKeys } from '@/services/presence/presence.keys';
import { useQuery } from '@tanstack/react-query';

export const useAllPresense = (allUserIds: string[]) =>
    useQuery({
        queryKey: presenceKeys.bulk(allUserIds),
        queryFn: () => getPresenceAll(allUserIds),
        enabled: allUserIds.length > 0,
        staleTime: Infinity,
    });
