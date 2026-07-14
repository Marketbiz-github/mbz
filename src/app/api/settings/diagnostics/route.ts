import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleAccessToken } from '@/lib/google-auth';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current settings
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const results: any = {
      ai_status: 'unconfigured',
      ga_status: 'unconfigured'
    };

    const errors: string[] = [];

    // Test GA
    if (settings.google_service_account_email && settings.google_private_key) {
      try {
        await getGoogleAccessToken(settings.google_service_account_email, settings.google_private_key);
        results.ga_status = 'ok';
      } catch (err: any) {
        results.ga_status = 'error';
        errors.push(`Google Analytics: ${err.message}`);
      }
    }

    // Test AI
    if (settings.ai_api_key && settings.ai_base_url) {
      try {
        const cleanBaseUrl = settings.ai_base_url.replace(/\/$/, '');
        let testRes;
        
        if (settings.ai_provider === 'gemini' || cleanBaseUrl.includes('generativelanguage.googleapis.com')) {
          const model = settings.ai_model_name || 'gemini-1.5-flash';
          const url = cleanBaseUrl.endsWith('/openai') 
            ? `${cleanBaseUrl}/chat/completions` 
            : `${cleanBaseUrl}/v1beta/models/${model}:generateContent?key=${settings.ai_api_key}`;
            
          if (cleanBaseUrl.endsWith('/openai')) {
            testRes = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.ai_api_key}`
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
          testRes = await fetch(`${cleanBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${settings.ai_api_key}`
            },
            body: JSON.stringify({
              model: settings.ai_model_name || 'gpt-4o',
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 1
            }),
            signal: AbortSignal.timeout(30000)
          });
        }

        if (!testRes.ok) {
          const testErr = await testRes.json().catch(() => ({}));
          throw new Error(testErr?.error?.message || `HTTP error! status: ${testRes.status}`);
        }
        results.ai_status = 'ok';
      } catch (err: any) {
        results.ai_status = 'error';
        errors.push(`AI Provider: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        ...results,
        error: errors.join(' | ')
      }, { status: 400 });
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Diagnostics error:', error);
    return NextResponse.json(
      { error: 'Gagal menjalankan diagnostik: ' + error.message },
      { status: 500 }
    );
  }
}
