import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase-admin';
import { createSessionToken, SESSION_COOKIE } from '@/lib/session';

export const runtime = 'nodejs';

// Valid-format dummy hash (60 chars) used when user not found, to keep response
// time constant and prevent user-enumeration via timing attacks.
const DUMMY_HASH = '$2b$12$invalidhashforsecurity0000000000000000000000000000000';

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

        const passwordValid = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

        if (!user || !passwordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await createSessionToken(user.id, user.username);

        const response = NextResponse.json({ success: true, username: user.username });
        response.cookies.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (err) {
        console.error('[admin/login]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
