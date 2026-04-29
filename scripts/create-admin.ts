/**
 * Create or reset the admin user password.
 * Usage: npx tsx scripts/create-admin.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((r) => rl.question(q, r));

async function main() {
    console.log('\n  Propheus — Create / Reset Admin User\n');

    const username = (await ask('  Username: ')).trim().toLowerCase();
    const password = (await ask('  Password: ')).trim();

    if (!username || password.length < 8) {
        console.error('\n  Error: username required and password must be at least 8 characters\n');
        process.exit(1);
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
        .from('admin_users')
        .upsert({ username, password_hash }, { onConflict: 'username' })
        .select('id, username, created_at')
        .single();

    if (error) {
        console.error('\n  Error:', error.message, '\n');
        process.exit(1);
    }

    console.log(`\n  Done — admin user "${data.username}" saved (id: ${data.id})\n`);
    rl.close();
}

main();
