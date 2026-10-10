import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  /**
   * No Supabase cookie means no session to refresh, so `getUser()` would be a round trip
   * to Supabase for nothing. On a public site most traffic is anonymous — crawlers and
   * scanners — and every one of those requests was paying for that round trip while the
   * function stayed active. Returning early makes anonymous traffic cost ~0.
   */
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'))
  if (!hasAuthCookie) return NextResponse.next({ request })

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  await supabase.auth.getUser()

  return supabaseResponse
}