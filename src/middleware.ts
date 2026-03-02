import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

const PUBLIC_PATHS = new Set([
  '/api/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/admin/login'
]);

function isPublic(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname === '/api/pricing' && request.method === 'GET') return true;
  if (pathname === '/api/testimonials' && request.method === 'GET') return true;
  if (pathname === '/api/site-content' && request.method === 'GET') return true;
  if (pathname === '/api/leads' && request.method === 'POST') return true;
  return false;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (isPublic(request)) {
    return NextResponse.next();
  }

  const token = getTokenFromHeader(request.headers.get('Authorization'));
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*']
};
