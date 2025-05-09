import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle Dynamic Auth API requests
  if (request.nextUrl.pathname.startsWith('/api/v0/sdk')) {
    const response = NextResponse.next()
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/v0/sdk/:path*',
} 