import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleAccessToken } from '@/lib/google-auth';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const projectId = searchParams.get('project_id');
    const range = searchParams.get('range') || '30daysAgo'; // today, 7daysAgo, 30daysAgo

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Load Project Website URL
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('website_url')
      .eq('id', projectId)
      .single();

    if (projError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Load GA credentials from system settings using admin client to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: settings } = await supabaseAdmin
      .from('system_settings')
      .select('google_service_account_email, google_private_key')
      .single();

    const hasCreds = settings?.google_service_account_email && settings?.google_private_key;
    const siteUrl = project.website_url;
    const hasProperty = !!siteUrl;

    // FALLBACK: Return mock data if credentials or website URL are not set
    if (!hasCreds || !hasProperty) {
      return NextResponse.json({
        isDemo: true,
        credsMissing: !hasCreds,
        propertyMissing: !hasProperty,
        keywords: [],
        topPages: []
      });
    }

    // Query Real GSC API
    try {
      // --- REAL GSC API (DISABLED FOR NOW, USING MANUAL INPUT) ---
      /*
      const accessToken = await getGoogleAccessToken(
        settings.google_service_account_email,
        settings.google_private_key
      );

      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      const startDate = new Date(endDate);
      if (range === 'today') {
        startDate.setDate(endDate.getDate());
      } else if (range === '7daysAgo') {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setDate(endDate.getDate() - 30);
      }
      
      const formatYMD = (d: Date) => d.toISOString().split('T')[0];
      const gscApiUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

      const keywordRes = await fetch(gscApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: formatYMD(startDate),
          endDate: formatYMD(endDate),
          dimensions: ['query', 'page'],
          rowLimit: 5000
        }),
      });

      if (!keywordRes.ok) {
        const errText = await keywordRes.text();
        throw new Error(`GSC Keyword report failed: ${errText}`);
      }

      const keywordData = await keywordRes.json();
      const keywords = (keywordData.rows || []).map((row: any) => ({
        keyword: row.keys[0],
        url: row.keys[1] ? row.keys[1].replace(siteUrl, '/').replace('//', '/') : '',
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(1),
        rank: row.position.toFixed(1)
      }));

      const pageRes = await fetch(gscApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: formatYMD(startDate),
          endDate: formatYMD(endDate),
          dimensions: ['page'],
          rowLimit: 5000
        }),
      });

      let topPages: any[] = [];
      if (pageRes.ok) {
        const pageData = await pageRes.json();
        topPages = (pageData.rows || []).map((row: any) => ({
          path: row.keys[0].replace(siteUrl, '/').replace('//', '/'),
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: (row.ctr * 100).toFixed(1),
          rank: row.position.toFixed(1)
        }));
      }
      */
      // --- END OF REAL GSC API ---

      let query = supabase
        .from('seo_gsc_manual')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      const todayStr = new Date().toISOString().split('T')[0];
      query = query.lte('date', todayStr); // Never include future dates in current view

      if (range !== 'all_time') {
        const endDate = new Date();
        const startDate = new Date(endDate);
        if (range === 'today') {
          startDate.setDate(endDate.getDate());
        } else if (range === '7daysAgo') {
          startDate.setDate(endDate.getDate() - 7);
        } else {
          startDate.setDate(endDate.getDate() - 30);
        }
        const formatYMD = (d: Date) => d.toISOString().split('T')[0];
        query = query.gte('date', formatYMD(startDate));
      }

      const { data: manualData, error: manualErr } = await query;

      if (manualErr) throw manualErr;

      // Group by keyword
      const keywordMap = new Map<string, any>();
      for (const row of manualData || []) {
        if (!keywordMap.has(row.keyword)) {
          keywordMap.set(row.keyword, {
            keyword: row.keyword,
            url: row.url || '',
            clicks: 0,
            impressions: 0,
            ctr: "0.0",
            rank: row.rank.toFixed(1), // Latest rank (since ordered by date desc)
            latest_id: row.id,
            history: []
          });
        }
        keywordMap.get(row.keyword).history.push({
          id: row.id,
          date: row.date,
          rank: parseFloat(row.rank)
        });
      }

      // Sort history ascending for charts and calculate rank change
      const keywords = Array.from(keywordMap.values()).map(kw => {
        kw.history.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (kw.history.length > 1) {
          const currentRank = kw.history[kw.history.length - 1].rank;
          const prevRank = kw.history[kw.history.length - 2].rank;
          kw.rankChange = prevRank - currentRank; // positive means rank improved
        } else {
          kw.rankChange = 0;
        }
        return kw;
      });

      const topPages: any[] = [];
      // --- END OF MANUAL GSC DATA ---

      return NextResponse.json({
        isDemo: false,
        keywords: keywords,
        topPages: topPages
      });
      
    } catch (apiErr: any) {
      console.error('GSC API execution failed, returning fallback mock data:', apiErr);
      return NextResponse.json({
        isDemo: true,
        apiError: apiErr.message,
        keywords: [],
        topPages: []
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
