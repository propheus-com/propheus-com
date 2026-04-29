import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

const REPORTS = [
    {
        file: 'nike_nyc_report.html',
        slug: 'nike-nyc-q7m4x9k2',
        title: 'Nike NYC Retail Intelligence',
        description: 'Foot traffic and consumer behaviour analysis for Nike NYC flagship stores',
    },
    {
        file: 'cfa_nyc_retailIntelligence_report.html',
        slug: 'cfa-nyc-r8t3v1p6',
        title: 'CFA NYC Retail Intelligence',
        description: 'Chick-fil-A retail intelligence report for NYC locations',
    },
    {
        file: 'dubai_report.html',
        slug: 'dubai-crisis-m9p2v4x1',
        title: 'Dubai Crisis Analysis',
        description: 'Physical AI analysis of the Dubai flooding crisis',
    },
    {
        file: 'bangalore_gba_story.html',
        slug: 'bangalore-gba-b4v2x9m1',
        title: 'Bangalore GBA Story',
        description: 'Greater Bangalore Area retail and urban intelligence report',
    },
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password, secret } = body ?? {};

        if (secret !== process.env.BOOTSTRAP_SECRET) {
            return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 });
        }

        if (!username || !password || password.length < 8) {
            return NextResponse.json(
                { error: 'Username required and password must be at least 8 characters' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Create or update admin user
        const password_hash = await bcrypt.hash(password, 12);
        const { error: userError } = await supabase
            .from('admin_users')
            .upsert(
                { username: username.toLowerCase().trim(), password_hash },
                { onConflict: 'username' }
            );

        if (userError) {
            return NextResponse.json({ error: `Admin user error: ${userError.message}` }, { status: 500 });
        }

        // Upload existing reports
        const reportResults: { slug: string; title: string; success: boolean; error?: string }[] = [];

        for (const report of REPORTS) {
            try {
                const filePath = path.join(process.cwd(), 'docs', 'reports', report.file);
                const html_content = await readFile(filePath, 'utf8');

                const { error } = await supabase.from('reports').upsert(
                    {
                        title: report.title,
                        slug: report.slug,
                        html_content,
                        description: report.description,
                        is_active: true,
                    },
                    { onConflict: 'slug' }
                );

                reportResults.push({ slug: report.slug, title: report.title, success: !error, error: error?.message });
            } catch (e) {
                reportResults.push({ slug: report.slug, title: report.title, success: false, error: String(e) });
            }
        }

        return NextResponse.json({
            success: true,
            adminCreated: true,
            reports: reportResults,
        });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

// GET — verify tables exist
export async function GET() {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from('admin_users').select('id').limit(1);
        return NextResponse.json({ tablesReady: !error, error: error?.message });
    } catch {
        return NextResponse.json({ tablesReady: false });
    }
}
