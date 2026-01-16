import Parser from 'rss-parser';
import { NewsItem } from './types';

// No OpenAI needed anymore!

const parser = new Parser();

// Verified Stable Chinese Tech/AI Feeds
const FEEDS = [
    { name: '机器之心', url: 'https://www.jiqizhixin.com/rss' },
    { name: '少数派', url: 'https://sspai.com/feed' },
    { name: 'OSCHINA', url: 'https://www.oschina.net/news/rss' },
    { name: '36氪', url: 'https://36kr.com/feed' },
];

// Simple in-memory cache
let memoryCache: { data: NewsItem[]; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 5; // 5 mins cache

// Product-focused Keywords for Filtering
const PRODUCT_KEYWORDS = [
    '发布', '上线', '推出', '更新', '功能', '公测', '内测', '开放', 'API', '工具', '助手', '模型', // Action words
    'Claude', 'GPT', 'Gemini', 'Sora', 'Llama', 'DeepSeek', 'Kimi', 'Midjourney', 'Stable Diffusion', // Core products
    'Apple', 'OpenAI', 'Google', 'Anthropic', 'Meta' // Major players
];

export async function getLatestNews(): Promise<NewsItem[]> {
    // Check cache
    if (memoryCache && (Date.now() - memoryCache.timestamp < CACHE_DURATION)) {
        return memoryCache.data;
    }

    const allNews: NewsItem[] = [];

    for (const feed of FEEDS) {
        try {
            const parsed = await parser.parseURL(feed.url);

            // Fetch more items since we are fast now!
            const recentItems = parsed.items.slice(0, 15);

            for (const item of recentItems) {
                if (!item.title || !item.link) continue;

                // Simple keyword filter to ensure it's somewhat relevant if the feed is mixed
                // But for these specific AI feeds, we can probably trust them.
                // Let's just trust the feed to be fast.

                // Keyword Filtering Logic
                const textToScan = (item.title + (item.contentSnippet || '')).toLowerCase();
                const isProductNews = PRODUCT_KEYWORDS.some(keyword => textToScan.includes(keyword.toLowerCase()));

                // If it doesn't match any product keywords, skip it (unless it's from a very trusted source)
                if (!isProductNews) {
                    // Optional: console.log(`Filtered out: ${item.title}`);
                    continue;
                }

                allNews.push({
                    id: Buffer.from(item.link).toString('base64'),
                    title: item.title,
                    // Use contentSnippet for summary, fallback to truncated content
                    summary: item.contentSnippet?.slice(0, 100) + '...' || '',
                    source: feed.name,
                    url: item.link,
                    date: item.pubDate || new Date().toISOString(),
                    isTranslated: false,
                    imageUrl: getImageUrl(item.content),
                });
            }
        } catch (error) {
            console.error(`Error fetching feed ${feed.name}:`, error);
        }
    }

    // Sort by date desceding
    const sorted = allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sorted.length > 0) {
        memoryCache = { data: sorted, timestamp: Date.now() };
    }

    return sorted;
}

function getImageUrl(content?: string): string | undefined {
    if (!content) return undefined;
    const match = content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : undefined;
}
