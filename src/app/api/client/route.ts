import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize service role client for admin actions
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// POST: Create client + auth user
export async function POST(request: Request) {
  try {
    const { name, website, picName, picEmail, services, status } = await request.json();

    // Check if profile/user with this email already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', picEmail)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ error: 'A client with this PIC Email already exists.' }, { status: 400 });
    }

    // 1. Create auth user with temp password
    const tempPassword = `mbz-${name.toLowerCase().replace(/\s+/g, '')}-pwd`;
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: picEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: picName }
    });

    if (userError) {
      return NextResponse.json({ error: `Auth User: ${userError.message}` }, { status: 400 });
    }

    const userId = userData.user.id;

    // The DB trigger handle_new_user() automatically inserts into profiles.
    // Let's update the profiles full_name just in case
    await supabaseAdmin
      .from('profiles')
      .update({ full_name: picName })
      .eq('id', userId);

    // 2. Insert client
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        name,
        website,
        status: status || 'active',
        owner_id: userId
      })
      .select()
      .single();

    if (clientError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: `Client Table: ${clientError.message}` }, { status: 400 });
    }

    // 3. Insert client services
    if (services && services.length > 0) {
      // Find service UUIDs by names
      const { data: srvs } = await supabaseAdmin
        .from('services')
        .select('id, name')
        .in('name', services);

      if (srvs && srvs.length > 0) {
        const clientServicesData = srvs.map(s => ({
          client_id: clientData.id,
          service_id: s.id
        }));

        const { error: srvError } = await supabaseAdmin
          .from('client_services')
          .insert(clientServicesData);

        if (srvError) {
          console.error('Error inserting client services:', srvError.message);
        }
      }
    }

    return NextResponse.json({ success: true, client: clientData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Edit client info + update auth user
export async function PUT(request: Request) {
  try {
    const { id, name, website, picName, picEmail, services, owner_id, status } = await request.json();

    if (!id || !owner_id) {
      return NextResponse.json({ error: 'Client ID and Owner ID are required' }, { status: 400 });
    }

    // Check if another client profile already uses this email
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', picEmail)
      .neq('id', owner_id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ error: 'This PIC Email is already in use by another client.' }, { status: 400 });
    }

    // 1. Update auth user details (email and meta full_name)
    const { error: userError } = await supabaseAdmin.auth.admin.updateUserById(owner_id, {
      email: picEmail,
      user_metadata: { full_name: picName }
    });

    if (userError) {
      return NextResponse.json({ error: `Auth User Update: ${userError.message}` }, { status: 400 });
    }

    // Update profile table
    await supabaseAdmin
      .from('profiles')
      .update({ full_name: picName, email: picEmail })
      .eq('id', owner_id);

    // 2. Update client details
    const { error: clientError } = await supabaseAdmin
      .from('clients')
      .update({
        name,
        website,
        status: status || 'active'
      })
      .eq('id', id);

    if (clientError) {
      return NextResponse.json({ error: `Client Update: ${clientError.message}` }, { status: 400 });
    }

    // 3. Sync client services (delete old, insert new)
    // Get service UUIDs for checked services
    const { data: srvs } = await supabaseAdmin
      .from('services')
      .select('id, name')
      .in('name', services || []);

    const targetServiceIds = srvs ? srvs.map(s => s.id) : [];

    // Delete current services not in target list
    await supabaseAdmin
      .from('client_services')
      .delete()
      .eq('client_id', id);

    // Insert all checked services
    if (targetServiceIds.length > 0) {
      const clientServicesData = targetServiceIds.map(sId => ({
        client_id: id,
        service_id: sId
      }));

      await supabaseAdmin
        .from('client_services')
        .insert(clientServicesData);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
