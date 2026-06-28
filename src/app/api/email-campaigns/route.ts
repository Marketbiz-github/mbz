import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Unauthorized access',
          data: null,
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
    const clientId = searchParams.get('client_id');
    const search = searchParams.get('search');

    // Calculate pagination range
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
      .from('email_blast_reports')
      .select('*, projects!inner(id, name, client_id, clients!inner(name))', { count: 'exact' })
      .order('sent_at', { ascending: false });

    // Apply filters
    if (clientId) {
      query = query.eq('projects.client_id', clientId);
    }
    if (search) {
      query = query.ilike('campaign_name', `%${search}%`);
    }

    // Fetch paginated data
    const { data, count, error } = await query.range(from, to);

    if (error) {
      throw error;
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Format data to match previous structure
    const formattedCampaigns = (data || []).map((camp: any) => ({
      ...camp,
      name: camp.campaign_name,
      client_id: camp.projects?.client_id,
      clients: {
        name: camp.projects?.clients?.name || 'Unknown'
      },
      projects: {
        id: camp.projects?.id,
        name: camp.projects?.name
      }
    }));

    return NextResponse.json(
      {
        status: 'success',
        message: 'Campaigns retrieved successfully',
        data: {
          campaigns: formattedCampaigns,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
          },
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: err.message || 'Internal server error',
        data: null,
      },
      { status: 500 }
    );
  }
}
