import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/cadastro'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Exemplo de liberação caso o usuário acessar a Home '/' deslogado, vai direto pro login
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/tvgph', request.url));
  }

  // Comportamento rotas públicas (usuário logado tentou acessar o login)
  if (isPublicRoute) {
    if (token) {
       return NextResponse.redirect(new URL('/tvgph', request.url));
    }
    return NextResponse.next();
  }

  // Comportamento rotas privadas
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Proteção do Dashboard (No MVP, idealmente decodificamos o token e vemos a role.
  // Como o NextJS edge não lê jsonwebtoken lib sem polyfills pro Node.
  // Podemos fazer a verificação usando a base JWT de atob ou edge libs).
  // Se for acessar o /dashboard e não for admin, é negado lá ou no fetch.
  // Pro MVP, a auth de token existe e é válido.

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
