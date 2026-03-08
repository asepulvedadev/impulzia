import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type Role = 'user' | 'business_owner' | 'admin'

const ROLE_ROUTES: Record<Role, string[]> = {
  user: ['/panel', '/panel/perfil'],
  business_owner: [
    '/panel',
    '/panel/negocio',
    '/panel/anuncios',
    '/panel/incentivos',
    '/panel/ia',
    '/panel/perfil',
  ],
  admin: [
    '/panel',
    '/panel/negocio',
    '/panel/anuncios',
    '/panel/incentivos',
    '/panel/ia',
    '/panel/admin',
    '/panel/perfil',
  ],
}

function isAllowed(pathname: string, role: Role): boolean {
  return ROLE_ROUTES[role].some((allowed) =>
    allowed === '/panel' ? pathname === '/panel' : pathname.startsWith(allowed),
  )
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Autenticado → no puede volver a login/signup ni a la landing
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isLanding = pathname === '/'
  if ((isAuthRoute || isLanding) && user) {
    return NextResponse.redirect(new URL('/panel', request.url))
  }

  // Rutas del panel
  const isPanelRoute = pathname.startsWith('/panel')
  if (isPanelRoute) {
    if (!user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile?.role ?? 'user') as Role

    if (!isAllowed(pathname, role)) {
      return NextResponse.redirect(new URL('/panel', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
