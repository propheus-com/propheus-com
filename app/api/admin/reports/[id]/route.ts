import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/reports/[id] — fetch single report including html_content
export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report: data });
}

// PUT /api/admin/reports/[id] — update a report
export async function PUT(request: NextRequest, { params }: Params) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { title, slug, html_content, description, is_active } = body ?? {};

        const updates: Record<string, unknown> = {};
        if (title !== undefined) updates.title = title;
        if (slug !== undefined) updates.slug = slug;
        if (html_content !== undefined) updates.html_content = html_content;
        if (description !== undefined) updates.description = description;
        if (is_active !== undefined) updates.is_active = is_active;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('reports')
            .update(updates)
            .eq('id', id)
            .select('id, title, slug, description, is_active, created_at, updated_at')
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A report with this slug already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json({ report: data });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

// DELETE /api/admin/reports/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from('reports').delete().eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
