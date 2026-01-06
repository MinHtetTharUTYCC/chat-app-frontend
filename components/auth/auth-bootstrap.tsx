'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { refresh } from '@/services/auth/auth.api';
import { useEffect } from 'react';

function AuthBootstrap() {
    useEffect(() => {
        refresh()
            .then(({ accessToken }) => {
                useAuthStore.getState().setAccessToken(accessToken);
            })
            .catch(() => {
                useAuthStore.getState().logout();
            })
            .finally(() => {
                useAuthStore.getState().setAuthReady(true);
            });
    }, []);
    return null;
}

export default AuthBootstrap;
