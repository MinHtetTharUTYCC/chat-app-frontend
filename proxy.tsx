import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname, origin } = request.nextUrl;

    // I M TIRED OF THIS PROXY : ))))))))))

    // Debug - log everything
    console.log('=== MIDDLEWARE DEBUG ===');
    console.log('Path:', pathname);
    console.log('Origin:', origin);
    console.log('All cookies:', request.cookies.getAll());
    console.log('Has refresh_token cookie:', request.cookies.has('refresh_token'));

    // TRY BOTH: Check cookie and header
    const cookieToken = request.cookies.get('refresh_token')?.value;
    const headerToken = request.headers.get('x-refresh-token');

    // Use cookie if available, otherwise header
    const hasRefreshToken = Boolean(cookieToken || headerToken);

    console.log('Cookie token exists:', !!cookieToken);
    console.log('Header token exists:', !!headerToken);
    console.log('Has refresh token:', hasRefreshToken);

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isApiRoute = pathname.startsWith('/api/');
    const isPublic = ['/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'].some((publicPath) =>
        pathname.startsWith(publicPath)
    );

    // Skip middleware for API routes and public files
    if (isApiRoute || isPublic) {
        console.log('Skipping middleware for:', pathname);
        return NextResponse.next();
    }

    // If no token and not on auth page → redirect to login
    if (!hasRefreshToken && !isAuthPage) {
        console.log(`Redirecting ${pathname} to /login - no token found`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If token exists and on auth page → redirect to home
    if (hasRefreshToken && isAuthPage) {
        console.log(`Redirecting ${pathname} to / - token exists on auth page`);
        return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('Allowing access to:', pathname);
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
