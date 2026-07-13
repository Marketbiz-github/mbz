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
    const clientId = searchParams.get('client_id');

    // Fetch projects with active GA property ID
    let projectQuery = supabase
      .from('projects')
      .select('id, ga_property_id')
      .not('ga_property_id', 'is', null)
      .neq('ga_property_id', '')
      .in('status', ['active', 'completed', 'on_hold']);

    if (clientId) {
      projectQuery = projectQuery.eq('client_id', clientId);
    }

    const { data: projects, error: projectsError } = await projectQuery;

    if (projectsError) {
      throw projectsError;
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
    const hasProjects = projects && projects.length > 0;

    // FALLBACK: Return mock aggregated data if credentials or active projects are missing
    if (!hasCreds || !hasProjects) {
      const activeProjCount = projects?.length || 0;
      return NextResponse.json({
        isDemo: true,
        credsMissing: !hasCreds,
        projectsCount: activeProjCount,
        activeUsers: activeProjCount > 0 ? (activeProjCount * 5 + 2) : 0,
        sessions: activeProjCount > 0 ? (activeProjCount * 1240) : 0,
        pageViews: activeProjCount > 0 ? (activeProjCount * 3820) : 0,
        users: activeProjCount > 0 ? (activeProjCount * 980) : 0,
        bounceRate: activeProjCount > 0 ? 42.5 : 0
      });
    }

    // Query Real Google Analytics 4 API for each property ID in parallel
    try {
      const accessToken = await getGoogleAccessToken(
        settings.google_service_account_email,
        settings.google_private_key
      );

      let totalActiveUsers = 0;
      let totalSessions = 0;
      let totalPageViews = 0;
      let totalUsers = 0;
      let bounceRateSum = 0;
      let validBounceCount = 0;

      const promises = projects.map(async (project) => {
        const propertyId = project.ga_property_id;
        if (!propertyId) return;

        try {
          // 1. Run Realtime Report (Active users in last 30 minutes)
          const realtimeRes = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                metrics: [{ name: 'activeUsers' }],
              }),
            }
          );

          let activeUsers = 0;
          if (realtimeRes.ok) {
            const rtData = await realtimeRes.json();
            activeUsers = parseInt(rtData.rows?.[0]?.metricValues?.[0]?.value || '0');
          }

          // 2. Run Historical Report (Last 30 Days)
          const historicalRes = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'date' }],
                metrics: [
                  { name: 'sessions' },
                  { name: 'screenPageViews' },
                  { name: 'activeUsers' },
                  { name: 'bounceRate' }
                ],
                dimensionFilter: {
                  filter: {
                    fieldName: 'sessionDefaultChannelGrouping',
                    stringFilter: {
                      matchType: 'EXACT',
                      value: 'Organic Search'
                    }
                  }
                }
              }),
            }
          );

          let sessions = 0;
          let pageViews = 0;
          let users = 0;
          let bounceRate = 0;

          if (historicalRes.ok) {
            const histData = await historicalRes.json();
            
            // Summarize all date rows
            if (histData.rows) {
              histData.rows.forEach((row: any) => {
                sessions += parseInt(row.metricValues?.[0]?.value || '0');
                pageViews += parseInt(row.metricValues?.[1]?.value || '0');
                users += parseInt(row.metricValues?.[2]?.value || '0');
              });
            }

            // Get averages from totals
            if (histData.totals?.[0]?.metricValues) {
              bounceRate = parseFloat(histData.totals[0].metricValues[3]?.value || '0') * 100;
            } else if (histData.rows && histData.rows.length > 0) {
              let rowBounceSum = 0;
              let rowBounceCount = 0;
              histData.rows.forEach((row: any) => {
                const bVal = parseFloat(row.metricValues?.[3]?.value || '0');
                if (bVal > 0) {
                  rowBounceSum += bVal;
                  rowBounceCount++;
                }
              });
              bounceRate = rowBounceCount > 0 ? (rowBounceSum / rowBounceCount) * 100 : 0;
            }
          }

          totalActiveUsers += activeUsers;
          totalSessions += sessions;
          totalPageViews += pageViews;
          totalUsers += users;
          if (bounceRate > 0) {
            bounceRateSum += bounceRate;
            validBounceCount++;
          }
        } catch (e) {
          console.error(`Error querying GA4 for property ${propertyId}:`, e);
        }
      });

      await Promise.all(promises);

      return NextResponse.json({
        isDemo: false,
        activeUsers: totalActiveUsers,
        sessions: totalSessions,
        pageViews: totalPageViews,
        users: totalUsers,
        bounceRate: validBounceCount > 0 ? (bounceRateSum / validBounceCount) : 0
      });
    } catch (apiErr: any) {
      console.error('Google API Error:', apiErr);
      return NextResponse.json(
        { error: apiErr.message || 'Failed to communicate with Google Analytics API' },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error('Aggregated GA Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
