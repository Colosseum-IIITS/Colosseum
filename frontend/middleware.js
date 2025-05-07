// middleware.js (Edge-compatible middleware using 'jose')
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Set a secret key directly for verifying JWT tokens
// WARNING: In production, this should be set through environment variables properly
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'fallback-secret-only-for-development';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Define protected routes
  const protectedRoutes = ['/admin', '/org', '/player'];
  
  // Check if the request is for a protected route
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtected) {
    // For non-protected routes, proceed normally
    return NextResponse.next();
  }

  // Look for authentication in either the 'user_jwt' cookie or a token cookie
  const userJwtCookie = req.cookies.get('user_jwt')?.value;
  const tokenCookie = req.cookies.get('token')?.value; // Also try 'token' as your backend might use this name
  
  // Try to extract token from Authorization header as fallback
  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
    
  // Use the first available token
  const token = userJwtCookie || tokenCookie || headerToken;
  
  // Debug logging for token sources
  console.log(`Middleware - Path: ${pathname}`);
  console.log(`Cookies: user_jwt=${!!userJwtCookie}, token=${!!tokenCookie}`);
  console.log(`Auth header token: ${!!headerToken}`);
  
  if (!token) {
    console.log('No authentication token found. Redirecting to /');
    
    // Check URL to avoid redirect loops
    if (pathname === '/' || pathname === '/auth') {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  try {
    // Attempt to verify the token
    const { payload } = await jwtVerify(token, secret);
    const { role } = payload;
    
    console.log(`JWT verification succeeded. User role: ${role}`);
    
    // Define roles allowed for specific routes
    const roleAccess = {
      '/admin': ['admin'],
      '/org': ['organiser', 'admin'],
      '/player': ['player', 'admin']
    };
    
    // Get route prefix (/admin, /org, /player)
    const routePrefix = '/' + pathname.split('/')[1];
    const allowedRoles = roleAccess[routePrefix] || [];
    
    if (!allowedRoles.includes(role)) {
      console.log(`Access denied: User role ${role} not authorized for ${routePrefix}`);
      return NextResponse.redirect(new URL('/no-access', req.url));
    }
    
    // Clone the request and set role headers for downstream components
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-role', role);
    
    // Allow the request to proceed
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    
  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // If we're already on the login page, don't redirect again
    if (pathname === '/' || pathname === '/auth') {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(new URL('/', req.url));
  }
}

// Apply middleware to specific paths
export const config = {
  matcher: ['/admin/:path*', '/org/:path*', '/player/:path*', '/no-access/:path*']
};
