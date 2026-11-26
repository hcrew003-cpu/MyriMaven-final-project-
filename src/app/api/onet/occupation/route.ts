
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabaseAdmin';

const ONET_BASE = 'https://api-v2.onetcenter.org';

const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const PARTIAL_CACHE_DURATION_MS = 60 * 60 * 1000;

const SECTION_PATHS = [
  { name: 'tasks', path: '/summary/tasks' },
  { name: 'skills', path: '/summary/skills' },
  { name: 'knowledge', path: '/summary/knowledge' },
  { name: 'education', path: '/summary/education' },
  {
    name: 'relatedOccupations',
    path: '/summary/related_occupations',
  },
  {
    name: 'workContext',
    path: '/summary/work_context?start=1&end=100',
  },
  {
    name: 'workStyles',
    path: '/summary/work_styles',
  },
];

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.trim();

  if (!code || !/^\d{2}-\d{4}\.\d{2}$/.test(code)) {
    return NextResponse.json(
      { error: 'Invalid occupation code.' },
      { status: 400 }
    );
  }

  let cached: any = null;
  let supabase: ReturnType<typeof getSupabaseAdminClient> | null = null;

  try {
    supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('onet_occupation_cache')
      .select('*')
      .eq('occupation_code', code)
      .maybeSingle();

    if (error) {
      console.error('O*NET cache read error:', error.message);
    } else {
      cached = data;
    }

    if (cached?.occupation_data) {
      const age =
        Date.now() - new Date(cached.fetched_at).getTime();

      const duration = cached.is_complete
        ? CACHE_DURATION_MS
        : PARTIAL_CACHE_DURATION_MS;

      if (age >= 0 && age < duration) {
        return NextResponse.json(
          cached.occupation_data,
          {
            headers: {
              'X-ONET-Cache': 'HIT',
            },
          }
        );
      }
    }
  } catch (error) {
    console.error('O*NET cache unavailable:', error);
  }

  const apiKey = process.env.ONET_API_KEY;

  if (!apiKey) {
    if (cached?.occupation_data) {
      return NextResponse.json(
        cached.occupation_data,
        {
          headers: {
            'X-ONET-Cache': 'STALE',
          },
        }
      );
    }

    return NextResponse.json(
      { error: 'O*NET API key is not configured.' },
      { status: 500 }
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
      throw new Error(
        `O*NET request failed for ${path}: ${response.status}`
      );
    }

    return response.json();
  }

  try {
    const overview = await getOnet('/');

    const sections = await Promise.allSettled(
      SECTION_PATHS.map((section) =>
        getOnet(section.path)
      )
    );

    const failedSections: string[] = [];
    const sectionData: Record<string, any> = {};

    sections.forEach((result, index) => {
      const name = SECTION_PATHS[index].name;

      if (result.status === 'fulfilled' && result.value != null) {
        sectionData[name] = result.value;
      } else {
        failedSections.push(name);

        // Preserve previously retrieved evidence
        // if an individual section fails to refresh.
        sectionData[name] =
          cached?.occupation_data?.[name] ?? null;
      }
    });

    const occupation = {
      id: code,
      title: overview.title,
      description: overview.description ?? '',
      tasks: sectionData.tasks,
      skills: sectionData.skills,
      knowledge: sectionData.knowledge,
      education: sectionData.education,
      relatedOccupations: sectionData.relatedOccupations,
      workContext: sectionData.workContext,
      workStyles: sectionData.workStyles,
      source: 'O*NET Web Services',
    };

    let cacheStatus = 'BYPASS';

    if (supabase) {
      try {
        const now = new Date().toISOString();

        const { error } = await supabase
          .from('onet_occupation_cache')
          .upsert(
            {
              occupation_code: code,
              title: occupation.title,
              occupation_data: occupation,
              is_complete: failedSections.length === 0,
              failed_sections: failedSections,
              fetched_at: now,
              updated_at: now,
            },
            {
              onConflict: 'occupation_code',
            }
          );

        if (error) {
          console.error(
            'O*NET cache write error:',
            error.message
          );
        } else {
          cacheStatus = 'MISS';
        }
      } catch (error) {
        console.error('Unable to update O*NET cache:', error);
      }
    }

    return NextResponse.json(occupation, {
      headers: {
        'X-ONET-Cache': cacheStatus,
      },
    });
  } catch (error) {
    console.error('O*NET occupation error:', error);

    // Keep existing career information available
    // if O*NET is temporarily unavailable.
    if (cached?.occupation_data) {
      return NextResponse.json(
        cached.occupation_data,
        {
          headers: {
            'X-ONET-Cache': 'STALE',
          },
        }
      );
    }

    return NextResponse.json(
      { error: 'Unable to load occupation details.' },
      { status: 502 }
    );
  }
}
