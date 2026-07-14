import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleAccessToken } from '@/lib/google-auth';

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

    // Validate Google Analytics credentials if provided
    if (body.google_service_account_email || body.google_private_key) {
      if (!body.google_service_account_email || !body.google_private_key) {
        return NextResponse.json(
          { error: 'Email Service Account dan Private Key harus diisi keduanya.' },
          { status: 400 }
        );
      }
      try {
        await getGoogleAccessToken(body.google_service_account_email, body.google_private_key);
      } catch (err: any) {
        return NextResponse.json(
          { error: `Validasi Kredensial Google gagal: ${err.message}` },
          { status: 400 }
        );
      }
    }

    // Validate AI credentials if provided
    if (body.ai_api_key) {
      if (!body.ai_base_url) {
        return NextResponse.json(
          { error: 'Base URL API harus diisi jika API Key diisi.' },
          { status: 400 }
        );
      }
      try {
        const cleanBaseUrl = body.ai_base_url.replace(/\/$/, '');
        let testRes;
        if (body.ai_provider === 'gemini' || cleanBaseUrl.includes('generativelanguage.googleapis.com')) {
          // Validate using Native Gemini API if provider is gemini or URL matches
          const model = body.ai_model_name || 'gemini-1.5-flash';
          // Use standard base URL if they only provided the host, otherwise respect their path
          const url = cleanBaseUrl.endsWith('/openai') 
            ? `${cleanBaseUrl}/chat/completions` 
            : `${cleanBaseUrl}/v1beta/models/${model}:generateContent?key=${body.ai_api_key}`;
            
          if (cleanBaseUrl.endsWith('/openai')) {
            testRes = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${body.ai_api_key}`
              },
              body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'ping' }],
                max_tokens: 1
              }),
              signal: AbortSignal.timeout(30000)
            });
          } else {
            testRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'ping' }] }]
              }),
              signal: AbortSignal.timeout(30000)
            });
          }
        } else {
          // Default OpenAI-compatible validation
          testRes = await fetch(`${cleanBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${body.ai_api_key}`
            },
            body: JSON.stringify({
              model: body.ai_model_name || 'gpt-4o',
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 1
            }),
            signal: AbortSignal.timeout(30000)
          });
        }

        if (!testRes.ok) {
          const testErr = await testRes.json().catch(() => ({}));
          const errMsg = testErr?.error?.message || `HTTP error! status: ${testRes.status}`;
          throw new Error(errMsg);
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: `Validasi Koneksi AI gagal: ${err.message}` },
          { status: 400 }
        );
      }
    }

    // We seed with a single constant ID
    const settingsId = '00000000-0000-0000-0000-000000000001';

    const updatePayload: Record<string, any> = {
      id: settingsId,
      updated_at: new Date().toISOString()
    };

    const allowedFields = [
      'ai_provider',
      'ai_api_key',
      'ai_base_url',
      'ai_model_name',
      'google_service_account_email',
      'google_private_key',
      'agency_name',
      'support_email',
      'support_whatsapp'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('system_settings')
      .upsert(updatePayload)
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
