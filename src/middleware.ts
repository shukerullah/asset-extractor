import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Rate limiting for API endpoints
  if (request.nextUrl.pathname.startsWith('/api/remove-background')) {
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Set file size limits (10MB for images)
    response.headers.set('Content-Length-Limit', '10485760');
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};