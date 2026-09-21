import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Allow up to 30s for serverless execution

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Verify CRON_SECRET if configured (optional security)
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')

  if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    const urlKey = request.nextUrl.searchParams.get('key')
    if (urlKey !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY',
      },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Active query to wake up and ping PostgreSQL via PostgREST
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: false })
      .limit(1)

    if (error) {
      console.error('[Keep-Alive] Supabase ping query error:', error.message)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          databaseUrl: supabaseUrl,
          latencyMs: Date.now() - startTime,
        },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime
    console.log(`[Keep-Alive] Supabase pinged successfully in ${duration}ms`)

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive ping successful. Project stays active!',
      timestamp: new Date().toISOString(),
      latencyMs: duration,
      sampleRecordFound: !!(data && data.length > 0),
    })
  } catch (err: any) {
    console.error('[Keep-Alive] Unexpected error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Unexpected server error',
        latencyMs: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}
