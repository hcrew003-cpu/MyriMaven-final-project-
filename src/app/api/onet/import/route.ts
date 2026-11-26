
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getSupabaseAdminClient } from '../../../../lib/supabaseAdmin';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ONET_BASE = 'https://api-v2.onetcenter.org';
const BATCH_SIZE = 5;

const SECTIONS = [
  ['tasks', '/summary/tasks'],
  ['skills', '/summary/skills'],
  ['knowledge', '/summary/knowledge'],
  ['education', '/summary/education'],
  ['relatedOccupations', '/summary/related_occupations'],
  ['workContext', '/summary/work_context?start=1&end=100'],
  ['workStyles', '/summary/work_styles'],
] as const;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  const secret = process.env.ONET_IMPORT_SECRET;
  const supplied = request.headers.get('authorization') ?? '';

  if (!secret) {
    return NextResponse.json(
      { error: 'Import is not configured.' },
      { status: 503 }
    );
  }

  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(supplied);

  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual)
  ) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const apiKey = process.env.ONET_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'O*NET is not configured.' },
      { status: 500 }
    );
  }

  const startedAt = Date.now();

  async function getOnet(path: string) {
    if (Date.now() - startedAt > 45000) {
      throw new Error('Batch time limit reached.');
    }

    await sleep(350);

    const response = await fetch(`${ONET_BASE}${path}`, {
      headers: {
        'X-API-Key': apiKey!,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`O*NET HTTP ${response.status}`);
    }

    return response.json();
  }

  try {
    const supabase = getSupabaseAdminClient();

    const catalog: { code: string; title: string }[] = [];

    let start = 1;
    let total = Infinity;

    while (start <= total) {
      const data = await getOnet(
        `/online/occupations/?start=${start}&end=${start + 999}`
      );

      const page = Array.isArray(data.occupation)
        ? data.occupation
        : [];

      total = Number(data.total ?? 0);

      if (!page.length) break;

      catalog.push(...page);
      start += page.length;

      if (start > 5000) {
        throw new Error('Unexpected catalog size.');
      }
    }

    const cachedCodes = new Set<string>();

    let offset = 0;

    while (true) {
      const { data, error } = await supabase
        .from('onet_occupation_cache')
        .select('occupation_code')
        .order('occupation_code')
        .range(offset, offset + 499);

      if (error) throw error;

      for (const row of data ?? []) {
        cachedCodes.add(row.occupation_code);
      }

      if (!data || data.length < 500) break;

      offset += 500;
    }

    const missing = catalog.filter(
      (career) =>
        /^\d{2}-\d{4}\.\d{2}$/.test(career.code) &&
        !cachedCodes.has(career.code)
    );

    const batch = missing.slice(0, BATCH_SIZE);

    let imported = 0;

    const failures: {
      code: string;
      error: string;
    }[] = [];

    for (const career of batch) {
      if (Date.now() - startedAt > 30000) break;

      try {
        const base = `/online/occupations/${career.code}`;

        const overview = await getOnet(`${base}/`);

        const occupation: Record<string, unknown> = {
          id: career.code,
          title: overview.title ?? career.title,
          description: overview.description ?? '',
          source: 'O*NET Web Services',
        };

        const failedSections: string[] = [];

        for (const [name, path] of SECTIONS) {
          try {
            occupation[name] = await getOnet(
              `${base}${path}`
            );
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Unknown error';

            if (message !== 'O*NET HTTP 422') {
              throw error;
            }

            occupation[name] = null;
            failedSections.push(name);
          }
        }

        const now = new Date().toISOString();

        const { error } = await supabase
          .from('onet_occupation_cache')
          .upsert(
            {
              occupation_code: career.code,
              title: occupation.title,
              occupation_data: occupation,
              is_complete: failedSections.length === 0,
              failed_sections: failedSections,
              fetched_at: now,
              updated_at: now,
            },
            { onConflict: 'occupation_code' }
          );

        if (error) throw error;

        imported++;
      } catch (error) {
        failures.push({
          code: career.code,
          error:
            error instanceof Error
              ? error.message
              : 'Import failed.',
        });

        // Stop the batch if an unexpected failure occurs.
        break;
      }
    }

    return NextResponse.json({
      totalCatalog: catalog.length,
      importedThisBatch: imported,
      remaining: missing.length - imported,
      failures,
    });
  } catch (error) {
    console.error('O*NET import error:', error);

    return NextResponse.json(
      { error: 'Unable to complete import batch.' },
      { status: 500 }
    );
  }
}
