import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check the refresh token cookie set by backend
    const token = request.cookies.get('refresh_token');

    const isAuthPage =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register');

    //if no token and not on login or register page, redirect to login
    if (!token && !isAuthPage) {
        console.log('No token found, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    //if login or register page and token exists, redirect to home
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/register'],
};
