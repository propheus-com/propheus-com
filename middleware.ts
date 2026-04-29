import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

const PROTECTED_PAGES = ['/admin-portal/dashboard', '/admin-portal/reports'];
// /api/admin/login and /api/admin/bootstrap use their own auth mechanisms
const UNPROTECTED_APIS = ['/api/admin/login', '/api/admin/bootstrap'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedPage = PROTECTED_PAGES.some((p) => pathname.startsWith(p));
    const isProtectedApi =
        pathname.startsWith('/api/admin') &&
        !UNPROTECTED_APIS.some((p) => pathname.startsWith(p));

    if (!isProtectedPage && !isProtectedApi) {
        return NextResponse.next();
    }

    const session = await getSessionFromRequest(request);

    if (!session) {
        if (isProtectedApi) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const loginUrl = new URL('/admin-portal', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin-portal/:path*', '/api/admin/:path*'],
};
