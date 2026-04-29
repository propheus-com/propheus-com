'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '../../_components/AdminShell';

interface ReportFormProps {
    mode: 'new' | 'edit';
    reportId?: string;
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

export default function ReportForm({ mode, reportId }: ReportFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(0);
    const [dragging, setDragging] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(mode === 'edit');
    const [error, setError] = useState('');
    const [slugEdited, setSlugEdited] = useState(false);

    const loadFile = useCallback((file: File) => {
        setFileName(file.name);
        setFileSize(file.size);
        const reader = new FileReader();
        reader.onload = (ev) => setHtmlContent((ev.target?.result as string) ?? '');
        reader.readAsText(file, 'utf-8');
    }, []);

    const loadReport = useCallback(async () => {
        if (mode !== 'edit' || !reportId) return;
        try {
            const res = await fetch(`/api/admin/reports/${reportId}`);
            if (res.status === 401) { router.replace('/admin-portal'); return; }
            if (!res.ok) { setError('Report not found'); return; }
            const data = await res.json();
            const r = data.report;
            setTitle(r.title);
            setSlug(r.slug);
            setDescription(r.description ?? '');
            setHtmlContent(r.html_content);
            setIsActive(r.is_active);
            setSlugEdited(true);
            setFileSize(r.html_content.length);
        } finally {
            setFetching(false);
        }
    }, [mode, reportId, router]);

    useEffect(() => { loadReport(); }, [loadReport]);

    useEffect(() => {
        if (mode === 'new' && !slugEdited) setSlug(slugify(title));
    }, [title, mode, slugEdited]);

    // Drag-and-drop
    useEffect(() => {
        const el = dropZoneRef.current;
        if (!el) return;
        const stop = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
        const onEnter = (e: DragEvent) => { stop(e); setDragging(true); };
        const onLeave = (e: DragEvent) => { stop(e); setDragging(false); };
        const onDrop = (e: DragEvent) => {
            stop(e);
            setDragging(false);
            const file = e.dataTransfer?.files[0];
            if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) loadFile(file);
        };
        el.addEventListener('dragenter', onEnter);
        el.addEventListener('dragover', onEnter);
        el.addEventListener('dragleave', onLeave);
        el.addEventListener('drop', onDrop);
        return () => {
            el.removeEventListener('dragenter', onEnter);
            el.removeEventListener('dragover', onEnter);
            el.removeEventListener('dragleave', onLeave);
            el.removeEventListener('drop', onDrop);
        };
    }, [loadFile]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!htmlContent.trim()) {
            setError('HTML content is required — upload a file or paste HTML.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                mode === 'new' ? '/api/admin/reports' : `/api/admin/reports/${reportId}`,
                {
                    method: mode === 'new' ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, slug, html_content: htmlContent, description, is_active: isActive }),
                }
            );
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'Save failed'); return; }
            router.push('/admin-portal/dashboard');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <AdminShell>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-6 h-6 border-2 border-[#008A89] border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminShell>
        );
    }

    return (
        <AdminShell>
            {/* Page header */}
            <div className="border-b border-[#141414] px-8 py-5 flex items-center gap-3">
                <Link
                    href="/admin-portal/dashboard"
                    className="text-[#444] hover:text-white text-sm transition-colors flex items-center gap-1.5"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Reports
                </Link>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="text-[#666] text-sm">
                    {mode === 'new' ? 'New Report' : 'Edit Report'}
                </span>
            </div>

            <div className="max-w-2xl mx-auto px-8 py-8">
                <h1 className="text-lg font-semibold text-white mb-6">
                    {mode === 'new' ? 'Add New Report' : 'Edit Report'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-950/30 border border-red-800/40 text-red-400 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <FormGroup label="Title" required>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Nike NYC Retail Intelligence Q2 2024"
                            className={inputCls}
                        />
                    </FormGroup>

                    {/* Slug */}
                    <FormGroup label="URL Slug" required hint={`Public URL: /report/${slug || '…'}`}>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] text-sm select-none">
                                /report/
                            </span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }}
                                required
                                placeholder="nike-nyc-q7m4x9k2"
                                className={`${inputCls} pl-[72px] font-mono`}
                            />
                        </div>
                    </FormGroup>

                    {/* Description */}
                    <FormGroup label="Description" hint="Short summary (optional)">
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Retail foot traffic analysis for Nike NYC flagship stores"
                            className={inputCls}
                        />
                    </FormGroup>

                    {/* HTML content */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-[#555] uppercase tracking-wider">
                                HTML Content <span className="text-red-400">*</span>
                            </label>
                            <div className="flex rounded-lg overflow-hidden border border-[#1e1e1e] text-xs">
                                {(['file', 'paste'] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setInputMode(m)}
                                        className={`px-3 py-1.5 transition-colors capitalize ${
                                            inputMode === m
                                                ? 'bg-[#008A89] text-white'
                                                : 'bg-[#141414] text-[#555] hover:text-white'
                                        }`}
                                    >
                                        {m === 'file' ? 'Upload File' : 'Paste HTML'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {inputMode === 'file' ? (
                            <div
                                ref={dropZoneRef}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                                    dragging
                                        ? 'border-[#008A89] bg-[#008A89]/5'
                                        : htmlContent
                                        ? 'border-[#1e2e2e] bg-[#0a1a1a] hover:border-[#008A89]/50'
                                        : 'border-[#1e1e1e] hover:border-[#2e2e2e]'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".html,.htm"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
                                />
                                {htmlContent ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center gap-2 text-[#008A89]">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <span className="text-sm font-medium">
                                                {fileName || 'HTML loaded'}
                                            </span>
                                        </div>
                                        <p className="text-[#444] text-xs">
                                            {(fileSize / 1024).toFixed(1)} KB · click or drop to replace
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#151515] border border-[#222] mx-auto">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.8">
                                                <polyline points="16 16 12 12 8 16" />
                                                <line x1="12" y1="12" x2="12" y2="21" />
                                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                            </svg>
                                        </div>
                                        <p className="text-[#666] text-sm">
                                            Drop your HTML file here or{' '}
                                            <span className="text-[#008A89]">click to browse</span>
                                        </p>
                                        <p className="text-[#333] text-xs">.html or .htm</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <textarea
                                value={htmlContent}
                                onChange={(e) => setHtmlContent(e.target.value)}
                                placeholder={'<!DOCTYPE html>\n<html>\n  <head>…</head>\n  <body>…</body>\n</html>'}
                                rows={14}
                                className={`${inputCls} font-mono text-xs leading-relaxed resize-y`}
                            />
                        )}

                        {htmlContent && inputMode === 'paste' && (
                            <p className="text-[#444] text-xs mt-1.5">
                                {(htmlContent.length / 1024).toFixed(1)} KB
                            </p>
                        )}
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between bg-[#0c0c0c] border border-[#181818] rounded-xl p-4">
                        <div>
                            <p className="text-sm text-[#ddd] font-medium">Publish report</p>
                            <p className="text-xs text-[#444] mt-0.5">
                                Active reports are publicly accessible at their URL
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive((v) => !v)}
                            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                                isActive ? 'bg-[#008A89]' : 'bg-[#222]'
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                    isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-[#008A89] hover:bg-[#007a79] active:bg-[#006e6e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
                        >
                            {loading && (
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {loading ? 'Saving…' : mode === 'new' ? 'Create Report' : 'Save Changes'}
                        </button>
                        <Link
                            href="/admin-portal/dashboard"
                            className="text-[#444] hover:text-white text-sm transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminShell>
    );
}

const inputCls =
    'w-full bg-[#0d0d0d] border border-[#1c1c1c] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#008A89] transition-colors';

function FormGroup({
    label,
    hint,
    required,
    children,
}: {
    label: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs text-[#555] uppercase tracking-wider">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-[#3a3a3a]">{hint}</p>}
        </div>
    );
}
