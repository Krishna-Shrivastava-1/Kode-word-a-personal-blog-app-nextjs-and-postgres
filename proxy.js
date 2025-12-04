import { NextResponse } from "next/server";
import { Authorized } from "./controllers/authControl";

export async function proxy(req) {
  try {
    const pathname = req.nextUrl.pathname;
    
    // ✅ Check authentication status FIRST
    const autho = await Authorized();
    
    // ✅ PUBLIC ROUTES: Allow access regardless of auth status
    const publicRoutes = ['/', '/about', '/contact'];
    const isBlogPost = pathname.startsWith('/blog/');
    
    if (publicRoutes.includes(pathname) || isBlogPost) {
      return NextResponse.next();
    }
    
    // ✅ AUTH PAGES: Redirect logged-in users to home
    const authPages = ['/sign-in', '/sign-up', '/otp'];
    if (authPages.includes(pathname)) {
      if (autho.success) {
        // User is logged in → redirect to home
        return NextResponse.redirect(new URL('/', req.url));
      }
      // User not logged in → allow access to auth pages
      return NextResponse.next();
    }
    
    // ✅ PROTECTED ROUTES: Require authentication
    if (!autho.success) {
      // User not logged in → redirect to sign-in
      const response = NextResponse.redirect(new URL('/sign-in', req.url));
      response.cookies.delete('token');
      return response;
    }
    
    // ✅ ADMIN ROUTES: Require admin role
    if (pathname.startsWith('/admin') && autho.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // ✅ Allow access + attach user info to headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', autho.user.id);
    response.headers.set('x-user-role', autho.user.role);
    return response;
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
}

export const config = {
  matcher: [
    '/sign-in',           // ✅ Added auth pages
    '/sign-up',           // ✅ Added auth pages
    '/otp',               // ✅ Added OTP page
    '/dashboard/:path*',  // Protected routes
    '/admin/:path*',      // Admin routes
    '/profile/:path*' ,    // User routes
    '/bookmark',
    '/setting'
  ]
};
