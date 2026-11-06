import { NextResponse } from 'next/server';

const HOST = 'theprintplanet.co.in';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'c3909b1zztheprintplanet2026index';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls: string[] = body.urls;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'A non-empty array of absolute URLs is required' },
        { status: 400 }
      );
    }

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls.slice(0, 10000), // IndexNow max batch limit
    };

    // Central IndexNow API sends to Bing, Yandex, Naver, Seznam, and AI search engines
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      return NextResponse.json({
        success: true,
        submitted: urls.length,
        message: 'Successfully submitted URLs to IndexNow network (Bing, Yandex, Copilot, Perplexity).',
      });
    }

    const errText = await response.text();
    return NextResponse.json(
      {
        success: false,
        status: response.status,
        error: errText,
      },
      { status: response.status }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal IndexNow error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'IndexNow endpoint active',
    host: HOST,
    keyLocation: KEY_LOCATION,
    docs: 'POST an array of URLs to instantly trigger search engine indexation.',
  });
}
