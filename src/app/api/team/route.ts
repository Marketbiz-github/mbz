import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Helper to create a service role client to perform auth actions
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// GET all admin profiles
export async function GET() {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the current user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: admins, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('updated_at', { ascending: false });

    if (selectError) throw selectError;

    return NextResponse.json(admins);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// CREATE new admin user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, and full name are required.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Create auth user with service role
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (createError) throw createError;
    if (!authData.user) throw new Error('Failed to create auth user record.');

    // 2. Update profile table to set role as admin and set name
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'admin',
        full_name: fullName,
        email: email
      })
      .eq('id', authData.user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, user: authData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE admin profile (name, email, is_active)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, fullName, email, isActive } = await request.json();

    if (!id || !fullName || !email) {
      return NextResponse.json({ error: 'ID, full name, and email are required.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Update Auth email using service role
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email: email,
      user_metadata: { full_name: fullName }
    });

    if (authUpdateError) throw authUpdateError;

    // 2. Update profiles record
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        email: email,
        is_active: isActive
      })
      .eq('id', id);

    if (profileUpdateError) throw profileUpdateError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

