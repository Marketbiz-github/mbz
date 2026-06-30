import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleAccessToken } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const propertyId = searchParams.get('property_id');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Load GA credentials from system settings
    const { data: settings } = await supabase
      .from('system_settings')
      .select('google_service_account_email, google_private_key')
      .single();

    const hasCreds = settings?.google_service_account_email && settings?.google_private_key;

    if (!hasCreds) {
      return NextResponse.json({
        valid: true,
        warning: 'Kredensial API Google Analytics belum diatur di Pengaturan Sistem, validasi dilewati.'
      });
    }

    // Call Google Analytics Data API to run a minimal realtime report to test connectivity
    try {
      const accessToken = await getGoogleAccessToken(
        settings.google_service_account_email,
        settings.google_private_key
      );

      const testRes = await fetch(
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

      if (!testRes.ok) {
        const errData = await testRes.json().catch(() => ({}));
        const googleError = errData.error?.message || 'Gagal terhubung ke Google Analytics API';
        return NextResponse.json({
          valid: false,
          error: `Google API Error: ${googleError}`
        });
      }

      return NextResponse.json({ valid: true });
    } catch (err: any) {
      return NextResponse.json({
        valid: false,
        error: `Gagal autentikasi/koneksi: ${err.message}`
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
