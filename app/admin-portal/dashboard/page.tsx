'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '../_components/AdminShell';

interface Report {
    id: string;
    title: string;
    slug: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/reports');
            if (res.status === 401) { router.replace('/admin-portal'); return; }
            const data = await res.json();
            setReports(data.reports ?? []);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
            setReports((prev) => prev.filter((r) => r.id !== id));
        } finally {
            setDeletingId(null);
        }
    }

    async function handleToggle(report: Report) {
        setTogglingId(report.id);
        try {
            const res = await fetch(`/api/admin/reports/${report.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !report.is_active }),
            });
            if (res.ok) {
                const data = await res.json();
                setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, ...data.report } : r)));
            }
        } finally {
            setTogglingId(null);
        }
    }

    const total = reports.length;
    const active = reports.filter((r) => r.is_active).length;

    return (
        <AdminShell>
            <div className="min-h-screen">
                {/* Page header */}
                <div className="border-b border-[#141414] px-8 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-base font-semibold text-white">Reports</h1>
                        {!loading && (
                            <p className="text-[#444] text-xs mt-0.5">
                                {total} total · {active} active
                            </p>
                        )}
                    </div>
                    <Link
                        href="/admin-portal/reports/new"
                        className="flex items-center gap-2 bg-[#008A89] hover:bg-[#007a79] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Report
                    </Link>
                </div>

                <div className="px-8 py-6">
                    {/* Stat cards */}
                    {!loading && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <StatCard
                                label="Total Reports"
                                value={total}
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                }
                            />
                            <StatCard
                                label="Active & Public"
                                value={active}
                                accent
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                }
                            />
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-[#0c0c0c] border border-[#181818] rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="inline-block w-6 h-6 border-2 border-[#008A89] border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-[#444] text-sm">Loading reports…</p>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#111] border border-[#1e1e1e] mb-4">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <p className="text-[#555] text-sm">No reports yet</p>
                                <Link
                                    href="/admin-portal/reports/new"
                                    className="text-[#008A89] text-sm hover:underline mt-2 inline-block"
                                >
                                    Add your first report →
                                </Link>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#141414]">
                                        <th className="text-left px-6 py-3.5 text-[10px] text-[#444] uppercase tracking-wider font-medium">
                                            Report
                                        </th>
                                        <th className="text-left px-4 py-3.5 text-[10px] text-[#444] uppercase tracking-wider font-medium hidden lg:table-cell">
                                            URL
                                        </th>
                                        <th className="text-left px-4 py-3.5 text-[10px] text-[#444] uppercase tracking-wider font-medium">
                                            Status
                                        </th>
                                        <th className="text-left px-4 py-3.5 text-[10px] text-[#444] uppercase tracking-wider font-medium hidden xl:table-cell">
                                            Updated
                                        </th>
                                        <th className="px-4 py-3.5" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report, i) => (
                                        <tr
                                            key={report.id}
                                            className={`hover:bg-[#0f0f0f] transition-colors group ${
                                                i < reports.length - 1 ? 'border-b border-[#111]' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-[#ddd] font-medium text-sm">{report.title}</p>
                                                {report.description && (
                                                    <p className="text-[#444] text-xs mt-0.5 max-w-[220px] truncate">
                                                        {report.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 hidden lg:table-cell">
                                                <a
                                                    href={`/report/${report.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-[#444] hover:text-[#008A89] font-mono text-xs transition-colors group/link"
                                                >
                                                    <span>/report/{report.slug}</span>
                                                    <svg
                                                        width="10"
                                                        height="10"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        className="opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0"
                                                    >
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                        <polyline points="15 3 21 3 21 9" />
                                                        <line x1="10" y1="14" x2="21" y2="3" />
                                                    </svg>
                                                </a>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => handleToggle(report)}
                                                    disabled={togglingId === report.id}
                                                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                                                        report.is_active
                                                            ? 'bg-emerald-950/50 text-emerald-400 hover:bg-emerald-950'
                                                            : 'bg-[#1a1a1a] text-[#555] hover:bg-[#222]'
                                                    } disabled:opacity-40`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            report.is_active ? 'bg-emerald-400' : 'bg-[#444]'
                                                        }`}
                                                    />
                                                    {togglingId === report.id
                                                        ? '…'
                                                        : report.is_active
                                                        ? 'Live'
                                                        : 'Draft'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 hidden xl:table-cell text-[#444] text-xs">
                                                {new Date(report.updated_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/admin-portal/reports/${report.id}`}
                                                        className="text-[#555] hover:text-white text-xs transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(report.id, report.title)}
                                                        disabled={deletingId === report.id}
                                                        className="text-[#444] hover:text-red-400 text-xs transition-colors disabled:opacity-40"
                                                    >
                                                        {deletingId === report.id ? '…' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}

function StatCard({
    label,
    value,
    icon,
    accent = false,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    accent?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border p-5 ${
                accent
                    ? 'bg-[#008A89]/5 border-[#008A89]/15'
                    : 'bg-[#0c0c0c] border-[#181818]'
            }`}
        >
            <div className={`mb-3 ${accent ? 'text-[#008A89]' : 'text-[#444]'}`}>{icon}</div>
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className={`text-xs mt-0.5 ${accent ? 'text-[#008A89]/70' : 'text-[#444]'}`}>{label}</p>
        </div>
    );
}
