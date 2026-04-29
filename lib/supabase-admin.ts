import { createClient } from '@supabase/supabase-js';

export interface AdminUser {
    id: string;
    username: string;
    password_hash: string;
    created_at: string;
}

export interface Report {
    id: string;
    title: string;
    slug: string;
    html_content: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export function createAdminClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
