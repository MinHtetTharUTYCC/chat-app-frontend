import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Check the refresh token cookie set by backend
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const hasRefreshToken = !!refreshToken && refreshToken.trim() !== '';
    const { pathname } = request.nextUrl;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

    //if no token and not on login or register page, redirect to login
    if (!hasRefreshToken && !isAuthPage) {
        console.log('no token and no auth page!!!!! redirecting to /login....');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    //if login or register page and token exists, redirect to home
    if (hasRefreshToken && isAuthPage) {
        console.log('token exists and is auth page!!!!! redirecting to home(/)....');
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|favicon.ico).*)'],
};
