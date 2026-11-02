
import { NextResponse } from 'next/server';

export const revalidate = 86400;

type Occupation = {
  code: string;
  title: string;
  datalevel?: boolean;
  zone?: { code: number; title: string };
};

export async function GET() {
  const apiKey = process.env.ONET_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'O*NET API key is not configured.' },
      { status: 500 }
    );
  }

  try {
    const occupations: Occupation[] = [];
    let start = 1;
    const pageSize = 1000;
    let total = Number.POSITIVE_INFINITY;

    while (start <= total) {
      const url = new URL(
        'https://api-v2.onetcenter.org/online/occupations/'
      );

      url.searchParams.set('start', String(start));
      url.searchParams.set('end', String(start + pageSize - 1));

      const response = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
          Accept: 'application/json',
        },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        throw new Error(`O*NET returned ${response.status}`);
      }

      const data = await response.json();

      total = Number(data.total ?? 0);

      const page = Array.isArray(data.occupation)
        ? (data.occupation as Occupation[])
        : [];

      if (!page.length) break;

      occupations.push(...page);
      start += page.length;

      if (start > 5000) break;
    }

    return NextResponse.json({
      total: occupations.length,
      careers: occupations.map((occupation) => ({
        id: occupation.code,
        title: occupation.title,
        datalevel: occupation.datalevel !== false,
        jobZone: occupation.zone?.title ?? null,
      })),
    });
  } catch (error) {
    console.error('O*NET catalog error:', error);

    return NextResponse.json(
      {
        error:
          'Unable to load the complete O*NET catalog right now.',
      },
      { status: 502 }
    );
  }
}
