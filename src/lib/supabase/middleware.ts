import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // PROTECTED ROUTES LOGIC
  const url = request.nextUrl.clone()
  const isLoginPage = url.pathname.startsWith('/login')
  const isClientPath = url.pathname.startsWith('/client')
  const isAdminPath = 
    url.pathname === '/dashboard' || 
    url.pathname.startsWith('/scheduler') || 
    url.pathname.startsWith('/email') || 
    url.pathname.startsWith('/ai-generator') || 
    url.pathname.startsWith('/crm') ||
    url.pathname.startsWith('/settings')
  
  if (!user && (isClientPath || isAdminPath)) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Fetch role to handle proper redirection
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (isLoginPage) {
      url.pathname = role === 'admin' ? '/dashboard' : '/client/dashboard'
      return NextResponse.redirect(url)
    }

    // Role-based path protection
    if (role === 'client' && isAdminPath) {
      url.pathname = '/client/dashboard'
      return NextResponse.redirect(url)
    }

    if (role === 'admin' && isClientPath) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
