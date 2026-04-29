import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'admin_session';

function getSecret() {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) throw new Error('Missing ADMIN_JWT_SECRET env var');
    return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string, username: string) {
    return new SignJWT({ userId, username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('8h')
        .setIssuedAt()
        .sign(getSecret());
}

export async function verifySessionToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as { userId: string; username: string };
    } catch {
        return null;
    }
}

// For use in Server Components and Route Handlers
export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

// For use in middleware (synchronous NextRequest)
export async function getSessionFromRequest(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}
