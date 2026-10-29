
import { NextRequest, NextResponse } from 'next/server';

const ONET_BASE = 'https://api-v2.onetcenter.org';

export async function GET(request: NextRequest) {
  const apiKey = process.env.ONET_API_KEY;
  const code = request.nextUrl.searchParams.get('code')?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: 'O*NET API key is not configured.' },
      { status: 500 }
    );
  }

  // Validate O*NET occupation codes
  if (!code || !/^\d{2}-\d{4}\.\d{2}$/.test(code)) {
    return NextResponse.json(
      { error: 'Invalid occupation code.' },
      { status: 400 }
    );
  }

  const base = `${ONET_BASE}/online/occupations/${code}`;

  async function getOnet(path: string) {
    const response = await fetch(`${base}${path}`, {
      headers: {
        'X-API-Key': apiKey!,
        Accept: 'application/json',
      },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`O*NET request failed: ${response.status}`);
    }

    return response.json();
  }

  try {
    const overview = await getOnet('/');

    const sections = await Promise.allSettled([
      getOnet('/summary/tasks'),
      getOnet('/summary/skills'),
      getOnet('/summary/knowledge'),
      getOnet('/summary/education'),
      getOnet('/summary/related_occupations'),
    ]);

    const section = (index: number) => {
      const result = sections[index];

      return result.status === 'fulfilled'
        ? result.value
        : null;
    };

    return NextResponse.json({
      id: code,
      title: overview.title,
      description: overview.description ?? '',
      tasks: section(0),
      skills: section(1),
      knowledge: section(2),
      education: section(3),
      relatedOccupations: section(4),
      source: 'O*NET Web Services',
    });
  } catch (error) {
    console.error('O*NET occupation error:', error);

    return NextResponse.json(
      { error: 'Unable to load occupation details.' },
      { status: 502 }
    );
  }
}
