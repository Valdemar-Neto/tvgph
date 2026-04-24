import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/register', '/docs', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if accessing Home '/' while logged out
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/tvgph', request.url));
  }

  // Auth routes: redirect to /tvgph if already logged in
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/tvgph', request.url));
    }
    return NextResponse.next();
  }

  // Other public routes: accessible to everyone
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/openapi',
    '/api/reports/presign',
  ];
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  // Public APIs: allowed without token
  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  // Global API Protection (private API routes)
  if (pathname.startsWith('/api')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // List of private routes that require authentication
  const privateRoutes = ['/tvgph', '/dashboard', '/attendance', '/my-profile', '/my-reports'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  // If trying to access a private route without a token, redirect to login
  if (isPrivateRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - gph-icon.png (logo)
     * - group-image.png (branding)
     */
    '/((?!_next/static|_next/image|favicon.ico|gph-icon.png|group-image.png).*)',
  ],
};
