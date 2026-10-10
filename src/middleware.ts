import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  /**
   * Static files must NOT wake the middleware.
   *
   * The previous matcher only excluded three paths, so EVERY other request ran the
   * middleware and hit Supabase Auth over the network — including requests for files
   * that do not exist. Measured on the live demo: `/.env` and `/wp-login.php` (the two
   * paths bots probe most) both returned 200 with `x-vercel-cache: MISS`, i.e. each one
   * woke a function. That is how an unused project burned 3h56m of the team's 4h of
   * Fluid Active CPU: 390K function invocations against only 275K CDN requests.
   *
   * This is the exclusion list from Supabase's own Next.js template, plus the extensions
   * that scanners ask for.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest|map)$).*)',
  ],
}