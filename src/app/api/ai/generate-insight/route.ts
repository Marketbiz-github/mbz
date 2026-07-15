import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reportType, reportData } = body;

    if (!reportType || !reportData) {
      return NextResponse.json({ error: 'Missing reportType or reportData' }, { status: 400 });
    }

    // Get current settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'System settings not found' }, { status: 500 });
    }

    if (!settings.ai_api_key || !settings.ai_base_url) {
      return NextResponse.json({ error: 'AI provider is not configured in settings.' }, { status: 400 });
    }

    const cleanBaseUrl = settings.ai_base_url.replace(/\/$/, '');
    const model = settings.ai_model_name || 'gemini-1.5-flash';
    
    const prompt = `Anda adalah seorang Digital Analyst profesional. Tugas Anda adalah memberikan analisis singkat, tajam, dan rekomendasi yang dapat ditindaklanjuti berdasarkan data report berikut. Format jawaban harus menggunakan format Markdown yang rapi (bold, bullet points jika perlu, hindari heading besar H1).
    
Jenis Report: ${reportType.toUpperCase()}
    
Data Report:
${JSON.stringify(reportData, null, 2)}
    
Tolong berikan kesimpulan performa dan 1-2 saran perbaikan untuk campaign/report ini. Jawab dalam Bahasa Indonesia.`;

    let generatedText = '';

    if (settings.ai_provider === 'gemini' || cleanBaseUrl.includes('generativelanguage.googleapis.com')) {
      const url = cleanBaseUrl.endsWith('/openai') 
        ? `${cleanBaseUrl}/chat/completions` 
        : `${cleanBaseUrl}/v1beta/models/${model}:generateContent?key=${settings.ai_api_key}`;
        
      if (cleanBaseUrl.endsWith('/openai')) {
        const testRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.ai_api_key}`
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }]
          }),
          signal: AbortSignal.timeout(60000)
        });
        const data = await testRes.json();
        if (!testRes.ok) throw new Error(data?.error?.message || 'API Error');
        generatedText = data.choices[0].message.content;
      } else {
        const testRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: AbortSignal.timeout(60000)
        });
        const data = await testRes.json();
        if (!testRes.ok) throw new Error(data?.error?.message || 'API Error');
        generatedText = data.candidates[0].content.parts[0].text;
      }
    } else {
      const testRes = await fetch(`${cleanBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.ai_api_key}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: AbortSignal.timeout(60000)
      });
      const data = await testRes.json();
      if (!testRes.ok) throw new Error(data?.error?.message || 'API Error');
      generatedText = data.choices[0].message.content;
    }

    return NextResponse.json({ insight: generatedText });
  } catch (error: any) {
    console.error('AI Insight error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat AI insight: ' + error.message },
      { status: 500 }
    );
  }
}
