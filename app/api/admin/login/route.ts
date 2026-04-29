import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase-admin';
import { createSessionToken, SESSION_COOKIE } from '@/lib/session';

export const runtime = 'nodejs';

// Dummy hash to keep response time constant (prevents user enumeration timing attacks)
const DUMMY_HASH = '$2b$12$dummyhashfortimingattackprevention00000000000000000000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body ?? {};

        if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data: user } = await supabase
            .from('admin_users')
            .select('id, username, password_hash')
            .eq('username', username.toLowerCase().trim())
            .single();

        // Always run bcrypt to prevent timing attacks even when user not found
        const hashToCheck = user?.password_hash ?? DUMMY_HASH;
        const passwordValid = await bcrypt.compare(password, hashToCheck);

        if (!user || !passwordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await createSessionToken(user.id, user.username);

        const response = NextResponse.json({ success: true, username: user.username });
        response.cookies.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60, // 8 hours
            path: '/',
        });

        return response;
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
