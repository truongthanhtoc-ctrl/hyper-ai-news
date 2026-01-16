'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, ExternalLink, Activity, Radio, Sparkles } from 'lucide-react';
import { NewsItem } from '@/lib/types';

const PAGE_SIZE = 10;

export default function Home() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [displayNews, setDisplayNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.status === 'success') {
        const newsData = data.news || [];
        setAllNews(newsData);
        setDisplayNews(newsData.slice(0, PAGE_SIZE));
        setHasMore(newsData.length > PAGE_SIZE);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setDisplayNews(prev => {
      const currentLength = prev.length;
      const nextBatch = allNews.slice(currentLength, currentLength + PAGE_SIZE);

      if (currentLength + nextBatch.length >= allNews.length) {
        setHasMore(false);
      }
      return [...prev, ...nextBatch];
    });
  }, [allNews, hasMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [loadMore]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setHasMore(true);
    fetchNews();
  };

  return (
    // Clean Future / Aero Theme (Light Mode Default)
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 overflow-x-hidden">

      {/* Subtle Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white to-transparent" />
      </div>

      {/* Header - Glass Frost */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-indigo-100 pt-safe-top shadow-sm">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none">
                Hyper<span className="text-indigo-600">AI</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Global Briefing</span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto pt-24 px-4 space-y-6">

        {/* Status Area */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Live Updates</span>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-white/50 px-2 py-1 rounded-md border border-slate-100">
            {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}
          </div>
        </div>

        {/* News Feed */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading && displayNews.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                {displayNews.map((item, index) => (
                  <NewsCard key={item.id} item={item} index={index} />
                ))}

                {/* Loading Sentinel */}
                {hasMore && (
                  <div ref={observerTarget} className="py-6 flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {!hasMore && displayNews.length > 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    You've reached the end
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 h-36 border border-slate-100 shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-12 bg-slate-100 rounded-md" />
        <div className="h-4 w-20 bg-slate-100 rounded-md" />
      </div>
      <div className="h-6 w-full bg-slate-100 rounded-md mb-2" />
      <div className="h-6 w-2/3 bg-slate-100 rounded-md mb-4" />
      <div className="h-4 w-full bg-slate-50 rounded-md" />
    </div>
  )
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link
        href={`/view?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
        className="block bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-indigo-200 hover:shadow-[0_8px_24px_rgb(79,70,229,0.12)] transition-all duration-300 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {item.source}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {new Date(item.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </div>

        <h3 className="text-[17px] font-bold text-slate-800 leading-snug mb-2 group-hover:text-indigo-700 transition-colors">
          {item.title}
        </h3>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
          {item.summary}
        </p>

        {/* Subtle Shine Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      </Link>
    </motion.article>
  );
}
