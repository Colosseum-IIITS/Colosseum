// middleware.js (Edge-compatible middleware using 'jose')
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Ensure that your environment variables are correctly loaded
const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

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
      // Verify the JWT token using 'jose'
      const { payload } = await jwtVerify(token, secret);

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
      console.error('JWT verification failed:', error);
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
