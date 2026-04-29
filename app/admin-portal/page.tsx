'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const redirect = searchParams.get('redirect') ?? '/admin-portal/dashboard';

    useEffect(() => {
        fetch('/api/admin/me')
            .then((r) => { if (r.ok) router.replace(redirect); })
            .catch(() => {});
    }, [redirect, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'Login failed'); return; }
            router.push(redirect);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#070707] flex items-center justify-center px-4">
            {/* Background grid */}
            <div
                className="fixed inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(#008A89 1px, transparent 1px), linear-gradient(to right, #008A89 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo area */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#008A89]/10 border border-[#008A89]/20 mb-4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008A89" strokeWidth="1.8">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <p className="text-[#008A89] text-[11px] tracking-[0.3em] uppercase font-semibold">Propheus</p>
                    <h1 className="text-xl font-semibold text-white mt-1">Admin Portal</h1>
                    <p className="text-[#444] text-sm mt-1">Sign in to continue</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-[#0d0d0d] border border-[#1c1c1c] rounded-2xl p-7 shadow-xl shadow-black/50"
                >
                    {error && (
                        <div className="bg-red-950/30 border border-red-800/40 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs text-[#555] uppercase tracking-wider">Username</label>
                            <input
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="admin"
                                className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#008A89] transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs text-[#555] uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#008A89] transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-[#008A89] hover:bg-[#007a79] active:bg-[#006e6e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in…
                            </span>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-[#333] text-xs">
                    First time?{' '}
                    <Link href="/admin-portal/setup" className="text-[#008A89] hover:text-[#00a8a7] transition-colors">
                        Run setup
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
