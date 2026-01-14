import { auth } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session;
  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname === '/login';
  const isAuthRoute = pathname.startsWith('/api/auth');
  const isTestRoute = pathname.startsWith('/api/test');
  const isStaticRoute =
    pathname.startsWith('/_next') || pathname === '/favicon.ico';

  // Allow static routes, auth routes, and test route
  if (isStaticRoute || isAuthRoute || isTestRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from login page
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow login page for non-logged-in users
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
