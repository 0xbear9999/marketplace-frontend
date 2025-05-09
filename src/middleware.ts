import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle Dynamic Auth API requests
  if (request.nextUrl.pathname.startsWith('/dynamic-auth')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
          'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Origin',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // Clone the request to modify headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Origin', 'https://app.dynamicauth.com')
    
    // Create a new request with modified headers
    const modifiedRequest = new Request(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
      redirect: 'follow',
    })

    const response = NextResponse.next({
      request: modifiedRequest,
    })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Origin')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/dynamic-auth/:path*',
} 