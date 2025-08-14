import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ENV } from '@/lib/config/env'

const base = ENV.BASE_PATH || ''

function stripBase(pathname: string): string {
  if (base && pathname.startsWith(base)) {
    const stripped = pathname.slice(base.length)
    return stripped.startsWith('/') ? stripped : `/${stripped}`
  }
  return pathname
}

export async function middleware(request: NextRequest) {
  const { nextUrl, headers, cookies } = request
  const { pathname } = nextUrl
  const relative = stripBase(pathname)

  if (headers.get('x-middleware-checked') === '1') {
    return NextResponse.next()
  }

  if (
    pathname.startsWith(`${base}/_next`) ||
    pathname.startsWith(`${base}/static`) ||
    pathname.startsWith(`${base}/public`) ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  if (ENV.MAINTENANCE && relative === '/') {
    const maintenanceUrl = new URL(`${base}/maintenance`, request.url)
    try {
      const res = await fetch(maintenanceUrl, {
        method: 'HEAD',
        headers: { 'x-middleware-checked': '1' },
      })
      if (res.ok) {
        return NextResponse.rewrite(maintenanceUrl)
      }
    } catch {
      /* ignore */
    }
  }

  if (relative === '/') {
    const toAdmin =
      nextUrl.searchParams.get('to') === 'admin' ||
      cookies.get('preferAdmin')?.value === '1'

    if (
      toAdmin ||
      (ENV.NEXT_PUBLIC_ADMIN_MODE === '1' && ENV.HOME_REDIRECT_STRICT)
    ) {
      const url = nextUrl.clone()
      url.pathname = `${base}/admin`
      url.searchParams.delete('to')
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  if (relative.startsWith('/admin')) {
    if (ENV.QA_BYPASS_AUTH) {
      return NextResponse.next()
    }

    const hasSession =
      cookies.get('auth_user') ||
      cookies.get('sb-access-token') ||
      cookies.get('session_id')

    if (!hasSession) {
      const url = nextUrl.clone()
      url.pathname = `${base}/auth/signin`
      url.searchParams.set('next', `${base}${relative}`)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/).*)'],
}

