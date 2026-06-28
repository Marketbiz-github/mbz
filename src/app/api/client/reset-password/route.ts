import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

export async function POST(request: Request) {
  try {
    const { owner_id, name } = await request.json();

    if (!owner_id || !name) {
      return NextResponse.json({ error: 'Owner ID and Client Name are required' }, { status: 400 });
    }

    // Generate a new temporary password with random 4 digits
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newPassword = `mbz-${name.toLowerCase().replace(/\s+/g, '')}-pwd-${randomDigits}`;

    // Update password in Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.updateUserById(owner_id, {
      password: newPassword
    });

    if (error) {
      return NextResponse.json({ error: `Auth Reset Error: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, newPassword });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
