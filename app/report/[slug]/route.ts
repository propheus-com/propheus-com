import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    const { slug } = await params;

    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('reports')
            .select('html_content, title')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return new NextResponse('Report not found.', {
                status: 404,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        return new NextResponse(data.html_content, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'private, no-store',
                'X-Robots-Tag': 'noindex, nofollow, noarchive',
            },
        });
    } catch {
        return new NextResponse('Internal server error.', {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}
