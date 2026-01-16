import { NextResponse } from 'next/server';
import { getLatestNews } from '@/lib/news';

export async function GET() {
    try {
        const news = await getLatestNews();
        return NextResponse.json({
            news,
            status: 'success',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch news', details: String(error) },
            { status: 500 }
        );
    }
}
