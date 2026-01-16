"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function ViewContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const title = searchParams.get('title');
    const router = useRouter();

    if (!url) return null;

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Fixed Header */}
            <header className="flex-none flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                >
                    <ArrowLeft size={24} />
                </button>

                <h1 className="flex-1 text-sm font-semibold text-slate-800 text-center truncate px-4">
                    {title || 'News Detail'}
                </h1>

                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 -mr-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                >
                    <ExternalLink size={20} />
                </a>
            </header>

            {/* Content Area */}
            <div className="flex-1 relative bg-slate-50 w-full">
                <iframe
                    src={url}
                    className="w-full h-full border-0"
                    title="Content View"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
            </div>
        </div>
    );
}

export default function ViewPage() {
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
            <ViewContent />
        </Suspense>
    );
}
