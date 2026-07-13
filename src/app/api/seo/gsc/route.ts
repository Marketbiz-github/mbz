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
      const accessToken = await getGoogleAccessToken(
        settings.google_service_account_email,
        settings.google_private_key
      );

      const endDate = new Date();
      
      // GSC typically has a 1-2 day data delay, so we shift endDate back by 1 day
      endDate.setDate(endDate.getDate() - 1);

      const startDate = new Date(endDate);
      if (range === 'today') {
        // Just today (shifted by 1 day)
        startDate.setDate(endDate.getDate());
      } else if (range === '7daysAgo') {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setDate(endDate.getDate() - 30);
      }
      
      const formatYMD = (d: Date) => d.toISOString().split('T')[0];

      // GSC API URL
      // Encode siteUrl because it can contain special characters (like https://)
      const gscApiUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

      // 1. Fetch Keywords (with Page URL)
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
        ctr: (row.ctr * 100).toFixed(1), // convert to percentage
        rank: row.position.toFixed(1)
      }));

      // 2. Fetch Top Pages
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
          path: row.keys[0].replace(siteUrl, '/').replace('//', '/'), // make it relative if possible
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: (row.ctr * 100).toFixed(1),
          rank: row.position.toFixed(1)
        }));
      }

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
