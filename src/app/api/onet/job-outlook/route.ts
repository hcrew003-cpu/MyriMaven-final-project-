import { NextRequest, NextResponse } from 'next/server';

const ONET_BASE = 'https://api-v2.onetcenter.org';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.trim();
  const apiKey = process.env.ONET_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'O*NET API key is not configured.' }, { status: 500 });
  }

  if (!code || !/^\d{2}-\d{4}\.\d{2}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid occupation code.' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${ONET_BASE}/mnm/careers/${encodeURIComponent(code)}/job_outlook`,
      {
        headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Job outlook data is not available for this occupation.' },
        { status: response.status === 422 || response.status === 404 ? 404 : 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      outlook: data.outlook ?? null,
      brightOutlook: Array.isArray(data.bright_outlook) ? data.bright_outlook : [],
      salary: data.salary ?? null,
      source: 'O*NET My Next Move / U.S. Bureau of Labor Statistics',
      projectionPeriod: '2025–2035',
      wageYear: 2025,
    });
  } catch (error) {
    console.error('O*NET job outlook error:', error);
    return NextResponse.json({ error: 'Unable to load job outlook data.' }, { status: 502 });
  }
}
