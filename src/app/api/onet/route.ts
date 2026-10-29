
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.ONET_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'O*NET API key is not configured.' },
      { status: 500 }
    );
  }

  const keyword = request.nextUrl.searchParams.get('keyword')?.trim();

  if (!keyword || keyword.length > 100) {
    return NextResponse.json(
      { error: 'Enter a search term up to 100 characters.' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(
      'https://api-v2.onetcenter.org/online/search'
    );

    url.searchParams.set('keyword', keyword);

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('O*NET API status:', response.status);

      return NextResponse.json(
        { error: 'Unable to retrieve careers from O*NET.' },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      total: data.total ?? 0,
      careers: (data.occupation ?? []).map(
        (occupation: { code: string; title: string }) => ({
          id: occupation.code,
          title: occupation.title,
        })
      ),
    });
  } catch (error) {
    console.error('O*NET connection error:', error);

    return NextResponse.json(
      { error: 'Career search is temporarily unavailable.' },
      { status: 500 }
    );
  }
}
