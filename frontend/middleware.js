// middleware.js (Edge-compatible middleware using 'jose')
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Set a secret key directly for verifying JWT tokens
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

  // Look for authentication in any available cookie
  const userJwtCookie = req.cookies.get('user_jwt')?.value;
  const tokenCookie = req.cookies.get('token')?.value;
  
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
    
    // Create the response
    const response = NextResponse.redirect(new URL('/', req.url));
    
    // Set a cookie that the client can read to know auth failed
    // This will trigger useAuth in the client to clear localStorage
    response.cookies.set('auth_failed', '1', { 
      path: '/',
      maxAge: 10 // Short-lived cookie
    });
    
    return response;
  }
  
  try {
    // Get route prefix (/admin, /org, /player)
    const routePrefix = '/' + pathname.split('/')[1];
    
    // Attempt to verify the token
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role;
    
    console.log(`JWT verification succeeded. User role: ${userRole}`);
    
    // Define roles allowed for specific routes
    const roleAccess = {
      '/admin': ['admin'],
      '/org': ['organiser', 'admin'],
      '/player': ['player', 'admin']
    };
    
    const allowedRoles = roleAccess[routePrefix] || [];
    
    if (!allowedRoles.includes(userRole)) {
      console.log(`Access denied: User role ${userRole} not authorized for ${routePrefix}`);
      return NextResponse.redirect(new URL('/no-access', req.url));
    }
    
    // Clone the request and set role headers for downstream components
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-user-id', payload.id);
    
    // Create response that continues the request
    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    
    // If we didn't have the token in a cookie but it was valid,
    // set it in a cookie so future requests can use it
    if (!userJwtCookie && !tokenCookie && token) {
      response.cookies.set('token', token, {
        path: '/',
        maxAge: 86400, // 1 day
        httpOnly: false, // Allow JavaScript access
        sameSite: 'lax',
      });
    }
    
    return response;
  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // If we're already on the login page, don't redirect again
    if (pathname === '/' || pathname === '/auth') {
      return NextResponse.next();
    }
    
    // Create the response
    const response = NextResponse.redirect(new URL('/', req.url));
    
    // Set a cookie that the client can read to know auth failed
    response.cookies.set('auth_failed', '1', { 
      path: '/',
      maxAge: 10 // Short-lived cookie
    });
    
    return response;
  }
}

// Apply middleware to specific paths
export const config = {
  matcher: ['/admin/:path*', '/org/:path*', '/player/:path*', '/no-access/:path*']
};
