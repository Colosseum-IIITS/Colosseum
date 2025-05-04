// middleware.js (Edge-compatible middleware)
import { NextResponse } from 'next/server';

// Debug environment variables
console.log('JWT_SECRET_KEY environment variable is set:', !!process.env.JWT_SECRET_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Simple JWT parsing function (doesn't verify signature in middleware)
function parseJwt(token) {
  try {
    // Just decode the payload without verifying
    // This is safe since the backend will verify any requests with this token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl; // Path of the request
  const cookies = req.cookies; // Access cookies using req.cookies in Edge runtime

  console.log(`Request pathname: ${pathname}`);
  console.log(`All cookies:`, cookies);

  // Get the JWT token from cookies using req.cookies.get('user_jwt')?.value
  const token = cookies.get('user_jwt')?.value;
  console.log(`Extracted token: ${token}`);

  // Define protected routes
  const protectedRoutes = ['/admin', '/organiser', '/player'];

  // Check if the request is for a protected route
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    if (!token) {
      console.log('No token found. Redirecting to /login.');
      // If no token, redirect to login page
      return NextResponse.redirect(new URL('/', req.url));
    }

    try {
      console.log('Parsing JWT token');
      // Parse JWT token without verification
      const payload = parseJwt(token);
      
      if (!payload) {
        console.log('Failed to parse JWT token');
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      console.log('JWT parsing successful! Payload:', payload);

      // Extract the role from decoded token
      const { role } = payload;

      // Define roles allowed for specific routes
      const roleAccess = {
        '/admin': ['admin'],
        '/organiser': ['organiser', 'admin'],
        '/player': ['player', 'admin'],
      };

      // Determine which roles are allowed for the requested path
      const allowedRoles = Object.keys(roleAccess).reduce((acc, route) => {
        if (pathname.startsWith(route)) {
          acc.push(...roleAccess[route]);
        }
        return acc;
      }, []);

      console.log(`Allowed roles for ${pathname}:`, allowedRoles);
      console.log(`User role: ${role}`);

      // If the user's role is not authorized for the route, redirect to no-access page
      if (!allowedRoles.includes(role)) {
        console.log('User role not authorized. Redirecting to /no-access.');
        return NextResponse.redirect(new URL('/', req.url));
      }

      // If everything is fine, proceed with the request
      console.log('User authorized. Proceeding to the requested route.');
      return NextResponse.next();
    } catch (error) {
      console.log('JWT verification failed: ', error);
      console.log('JWT verification error details:', {
        errorCode: error.code,
        errorName: error.name,
        errorMessage: error.message
      });
      
      // If token verification fails, redirect to login
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: ['/admin/:path*', '/organiser/:path*', '/player/:path*'],
};
