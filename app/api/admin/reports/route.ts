import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// Vercel / Next.js default body limit is 4 MB — large HTML files may need this
export const maxDuration = 30;

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

// GET /api/admin/reports — list all reports
export async function GET() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('reports')
        .select('id, title, slug, description, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reports: data });
}

// POST /api/admin/reports — create a new report
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, slug: rawSlug, html_content, description = '', is_active = true } = body ?? {};

        if (!title || !html_content) {
            return NextResponse.json({ error: 'Title and html_content are required' }, { status: 400 });
        }

        const slug = rawSlug ? slugify(rawSlug) : slugify(title);

        if (!slug) {
            return NextResponse.json({ error: 'Could not generate a valid slug from the title' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('reports')
            .insert({ title, slug, html_content, description, is_active })
            .select('id, title, slug, description, is_active, created_at, updated_at')
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A report with this slug already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ report: data }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
