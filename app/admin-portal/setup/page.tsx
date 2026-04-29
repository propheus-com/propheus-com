'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SETUP_SQL = `-- Run this once in your Supabase SQL Editor
-- supabase.com → Project → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS admin_users (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username        TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS reports (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  html_content  TEXT NOT NULL,
  description   TEXT DEFAULT '',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();`;

type Step = 'sql' | 'credentials' | 'seeding' | 'done';

interface SeedResult {
    slug: string;
    title: string;
    success: boolean;
    error?: string;
}

export default function SetupPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('sql');
    const [copied, setCopied] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [seeding, setSeeding] = useState(false);
    const [seedError, setSeedError] = useState('');
    const [seedResults, setSeedResults] = useState<SeedResult[]>([]);

    function copySQL() {
        navigator.clipboard.writeText(SETUP_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function verifyTables() {
        setVerifying(true);
        setVerifyError('');
        try {
            const res = await fetch('/api/admin/bootstrap');
            const data = await res.json();
            if (data.tablesReady) {
                setStep('credentials');
            } else {
                setVerifyError(
                    data.error
                        ? `Tables not found: ${data.error}`
                        : 'Tables not found. Please run the SQL above first, then try again.'
                );
            }
        } catch {
            setVerifyError('Network error. Is the server running?');
        } finally {
            setVerifying(false);
        }
    }

    async function runBootstrap(e: React.FormEvent) {
        e.preventDefault();
        setSeedError('');
        setSeeding(true);
        setStep('seeding');

        try {
            const res = await fetch('/api/admin/bootstrap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    secret: 'propheus-bootstrap-init-2024-xK9mP3vQ',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSeedError(data.error ?? 'Setup failed');
                setStep('credentials');
                return;
            }

            setSeedResults(data.reports ?? []);
            setStep('done');
        } catch {
            setSeedError('Network error. Please try again.');
            setStep('credentials');
        } finally {
            setSeeding(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#070707] flex items-start justify-center px-4 py-16">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="mb-10">
                    <p className="text-[#008A89] text-[11px] tracking-[0.3em] uppercase font-semibold mb-2">
                        Propheus
                    </p>
                    <h1 className="text-2xl font-semibold text-white">Initial Setup</h1>
                    <p className="text-[#555] text-sm mt-1">
                        Run this once to configure your database and admin account.
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {(['sql', 'credentials', 'done'] as const).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                                    step === s || (step === 'seeding' && s === 'credentials') || (step === 'done' && s !== 'sql')
                                        ? 'bg-[#008A89] text-white'
                                        : step === 'sql' && i > 0
                                        ? 'bg-[#1a1a1a] text-[#444]'
                                        : 'bg-[#1a1a1a] text-[#444]'
                                }`}
                            >
                                {i + 1}
                            </div>
                            <span
                                className={`text-xs ${
                                    step === s ? 'text-white' : 'text-[#444]'
                                }`}
                            >
                                {s === 'sql' ? 'Database' : s === 'credentials' ? 'Admin Account' : 'Done'}
                            </span>
                            {i < 2 && <span className="text-[#222] mx-1">—</span>}
                        </div>
                    ))}
                </div>

                {/* Step 1: SQL */}
                {step === 'sql' && (
                    <div className="space-y-4">
                        <div className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                                    <span className="text-[#444] text-xs ml-2">Supabase SQL Editor</span>
                                </div>
                                <button
                                    onClick={copySQL}
                                    className={`text-xs px-3 py-1 rounded-md transition-colors ${
                                        copied
                                            ? 'bg-emerald-900/40 text-emerald-400'
                                            : 'bg-[#1a1a1a] text-[#666] hover:text-white'
                                    }`}
                                >
                                    {copied ? '✓ Copied' : 'Copy SQL'}
                                </button>
                            </div>
                            <pre className="p-4 text-[11px] text-[#8b9eb0] font-mono leading-relaxed overflow-x-auto whitespace-pre">
                                {SETUP_SQL}
                            </pre>
                        </div>

                        <div className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl p-4">
                            <p className="text-white text-sm font-medium mb-2">How to run this</p>
                            <ol className="space-y-1.5 text-[#666] text-sm">
                                <li className="flex gap-2">
                                    <span className="text-[#008A89] shrink-0">1.</span>
                                    Open your{' '}
                                    <span className="text-[#888]">Supabase Dashboard → SQL Editor → New query</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#008A89] shrink-0">2.</span>
                                    Paste the SQL above and click{' '}
                                    <span className="text-[#888]">Run</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#008A89] shrink-0">3.</span>
                                    Come back here and click{' '}
                                    <span className="text-[#888]">Verify & Continue</span>
                                </li>
                            </ol>
                        </div>

                        {verifyError && (
                            <div className="bg-red-950/30 border border-red-800/40 text-red-400 text-sm rounded-xl px-4 py-3">
                                {verifyError}
                            </div>
                        )}

                        <button
                            onClick={verifyTables}
                            disabled={verifying}
                            className="w-full bg-[#008A89] hover:bg-[#007a79] disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
                        >
                            {verifying ? 'Checking tables…' : 'Verify & Continue →'}
                        </button>
                    </div>
                )}

                {/* Step 2: Credentials */}
                {step === 'credentials' && (
                    <form onSubmit={runBootstrap} className="space-y-4">
                        <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
                            <p className="text-white text-sm font-medium">Create your admin account</p>

                            {seedError && (
                                <div className="bg-red-950/30 border border-red-800/40 text-red-400 text-sm rounded-lg px-4 py-3">
                                    {seedError}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-xs text-[#555] uppercase tracking-wider">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="admin"
                                    className="w-full bg-[#141414] border border-[#252525] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#008A89] transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs text-[#555] uppercase tracking-wider">
                                    Password{' '}
                                    <span className="normal-case text-[#444]">(min 8 characters)</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="w-full bg-[#141414] border border-[#252525] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#008A89] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-4">
                            <p className="text-[#888] text-sm mb-2">Also uploading 4 existing reports:</p>
                            <ul className="space-y-1">
                                {[
                                    'Nike NYC Retail Intelligence',
                                    'CFA NYC Retail Intelligence',
                                    'Dubai Crisis Analysis',
                                    'Bangalore GBA Story',
                                ].map((r) => (
                                    <li key={r} className="flex items-center gap-2 text-xs text-[#555]">
                                        <span className="text-[#008A89]">→</span> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={seeding}
                            className="w-full bg-[#008A89] hover:bg-[#007a79] disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
                        >
                            Create Admin & Upload Reports →
                        </button>
                    </form>
                )}

                {/* Seeding progress */}
                {step === 'seeding' && (
                    <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-6 text-center space-y-3">
                        <div className="inline-block w-8 h-8 border-2 border-[#008A89] border-t-transparent rounded-full animate-spin" />
                        <p className="text-white text-sm">Setting up your account and uploading reports…</p>
                        <p className="text-[#444] text-xs">This may take a few seconds</p>
                    </div>
                )}

                {/* Done */}
                {step === 'done' && (
                    <div className="space-y-4">
                        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <p className="text-emerald-400 font-medium text-sm">Setup complete!</p>
                            </div>
                            <p className="text-[#666] text-sm">
                                Admin account created and reports uploaded.
                            </p>
                        </div>

                        <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-4">
                            <p className="text-[#666] text-xs mb-3 uppercase tracking-wider">Reports uploaded</p>
                            <ul className="space-y-2">
                                {seedResults.map((r) => (
                                    <li key={r.slug} className="flex items-center gap-2 text-sm">
                                        <span className={r.success ? 'text-emerald-400' : 'text-red-400'}>
                                            {r.success ? '✓' : '✗'}
                                        </span>
                                        <span className={r.success ? 'text-[#aaa]' : 'text-red-400'}>
                                            {r.title}
                                        </span>
                                        {r.error && (
                                            <span className="text-red-500 text-xs ml-auto truncate max-w-[200px]">
                                                {r.error}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => router.push('/admin-portal')}
                            className="w-full bg-[#008A89] hover:bg-[#007a79] text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
                        >
                            Go to Login →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
