'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [username, setUsername] = useState('');

    useEffect(() => {
        fetch('/api/admin/me')
            .then((r) => r.json())
            .then((d) => d.username && setUsername(d.username))
            .catch(() => {});
    }, []);

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.replace('/admin-portal');
    }

    const isReports =
        pathname.startsWith('/admin-portal/dashboard') ||
        pathname.startsWith('/admin-portal/reports');

    return (
        <div className="flex min-h-screen bg-[#070707]">
            {/* Sidebar */}
            <aside className="w-52 fixed inset-y-0 left-0 flex flex-col bg-[#0c0c0c] border-r border-[#1a1a1a]">
                {/* Brand */}
                <div className="h-14 px-5 flex items-center border-b border-[#1a1a1a] shrink-0">
                    <div>
                        <p className="text-[#008A89] text-[11px] font-semibold tracking-[0.3em] uppercase">
                            Propheus
                        </p>
                        <p className="text-[#2e2e2e] text-[10px] tracking-wide mt-0.5">Admin Console</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2.5 py-3 space-y-0.5">
                    <SidebarItem
                        href="/admin-portal/dashboard"
                        label="Reports"
                        active={isReports}
                        icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                        }
                    />
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-[#1a1a1a] shrink-0">
                    {username && (
                        <p className="text-[#383838] text-[11px] font-mono truncate mb-3">{username}</p>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-[#444] hover:text-[#aaa] text-xs transition-colors"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 ml-52 min-h-screen">{children}</div>
        </div>
    );
}

function SidebarItem({
    href,
    label,
    active,
    icon,
}: {
    href: string;
    label: string;
    active: boolean;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                    ? 'bg-[#008A89]/10 text-[#008A89]'
                    : 'text-[#555] hover:text-white hover:bg-[#151515]'
            }`}
        >
            {icon}
            {label}
        </Link>
    );
}
