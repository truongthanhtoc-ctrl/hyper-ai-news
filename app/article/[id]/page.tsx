'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Share2, Globe, Clock, ExternalLink, Sparkles } from 'lucide-react';

interface ArticleData {
    title: string;
    content: string;
    originalUrl: string;
    siteName: string;
    isHtml?: boolean;
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const encodedUrl = resolvedParams.id;
    const originalUrl = decodeURIComponent(encodedUrl);

    const [article, setArticle] = useState<ArticleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch('/api/article', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: originalUrl }),
                });

                const data = await res.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setArticle(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load article');
            } finally {
                setLoading(false);
            }
        };

        if (originalUrl) {
            fetchArticle();
        }
    }, [originalUrl]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl"
                    >
                        <Sparkles className="text-white w-8 h-8" />
                    </motion.div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        正在开启纯净阅读
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                        正在为您去除广告和杂乱排版...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div className="max-w-xs">
                    <div className="text-red-500 mb-4 text-4xl">Ops</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <Link href="/" className="px-6 py-3 bg-gray-100 dark:bg-white/10 rounded-full font-medium">
                        返回首页
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-gray-100 pb-20">

            {/* Floating Header */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-4 border-b border-gray-100 dark:border-white/5"
            >
                <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        {/* Just a dummy icon now, no longer translate */}
                        <Globe size={20} className="text-gray-400" />
                    </button>
                    <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <Share2 size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Article Content */}
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto pt-24 px-5"
            >
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {article?.siteName || 'News'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Pure View
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight mb-8">
                    {article?.title}
                </h1>

                {/* Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mb-8" />

                {/* Content Body - HTML Rendering for Readability content */}
                <div
                    className="prose prose-lg dark:prose-invert prose-blue max-w-none leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-img:rounded-2xl"
                    dangerouslySetInnerHTML={{ __html: article?.content || '' }}
                />

                {/* Footer Link */}
                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
                    <a
                        href={article?.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                        访问原始网页 <ExternalLink size={14} />
                    </a>
                </div>

            </motion.article>
        </div>
    );
}
