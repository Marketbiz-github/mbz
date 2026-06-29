import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get settings
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      // If none exist, fetch default empty structure
      return NextResponse.json({
        agency_name: 'Marketbiz Digital',
        support_email: 'support@marketbiz.id',
        support_whatsapp: '',
        ai_provider: 'openai',
        ai_api_key: '',
        ai_base_url: 'https://api.openai.com/v1',
        ai_model_name: 'gpt-4o',
        google_service_account_email: '',
        google_private_key: ''
      });
    }

    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // We seed with a single constant ID
    const settingsId = '00000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        id: settingsId,
        ai_provider: body.ai_provider,
        ai_api_key: body.ai_api_key,
        ai_base_url: body.ai_base_url,
        ai_model_name: body.ai_model_name,
        google_service_account_email: body.google_service_account_email,
        google_private_key: body.google_private_key,
        agency_name: body.agency_name,
        support_email: body.support_email,
        support_whatsapp: body.support_whatsapp,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
