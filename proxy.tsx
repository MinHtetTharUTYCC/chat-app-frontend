import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Check the refresh token cookie set by backend
    const hasRefreshToken = request.cookies.has('refresh_token');

    const { pathname } = request.nextUrl;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

    //if no token and not on login or register page, redirect to login
    if (!hasRefreshToken && !isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    //if login or register page and token exists, redirect to home
    if (hasRefreshToken && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|favicon.ico|login|register).*)'],
};
