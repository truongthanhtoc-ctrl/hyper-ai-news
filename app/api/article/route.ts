import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// No OpenAI, purely extraction

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // --- Step 1: Fetch HTML ---
        const controller = new AbortController();
        const timeoutMsg = setTimeout(() => controller.abort(), 15000); // 15s timeout is enough for raw fetch

        let html = '';
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                },
                signal: controller.signal
            });
            clearTimeout(timeoutMsg);

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }
            html = await response.text();
        } catch (fetchError: any) {
            clearTimeout(timeoutMsg);
            console.error(`Fetch failed for ${url}:`, fetchError);
            return NextResponse.json(
                { error: 'Failed to load page', details: fetchError.message },
                { status: 504 }
            );
        }

        // --- Step 2: Parse Content ---
        let article = null;
        try {
            const dom = new JSDOM(html, { url });
            const reader = new Readability(dom.window.document);
            article = reader.parse();
        } catch (parseError) {
            console.error('Readability parsing failed:', parseError);
        }

        if (!article || !article.content) {
            return NextResponse.json({ error: 'Failed to extract content' }, { status: 422 });
        }

        // Direct return of the cleaned content (HTML is fine for Readability, but let's encourage simple rendering)
        // Actually Readability returns HTML in .content.
        // To keep our frontend consistent (which expects markdown), we might want to just send the HTML
        // and letting the frontend render it. 
        // BUT our frontend uses ReactMarkdown. 
        // Let's quickly convert HTML to text or just return the textContent if we are lazy, 
        // or better: Let's just return the textContent for now as a simple reader.
        // Wait, raw textContent loses formatting (bold, links).
        // Let's return the HTML and update the frontend to render HTML (dangerouslySetInnerHTML) which is standard for Readability.

        return NextResponse.json({
            title: article.title,
            content: article.content, // This is CLEANED HTML, not Markdown
            originalUrl: url,
            siteName: article.siteName || 'Source',
            isHtml: true // Flag to tell frontend to render HTML
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Server Error', details: String(error) },
            { status: 500 }
        );
    }
}
