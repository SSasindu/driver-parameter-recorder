import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];

// Public routes that don't require authentication
const publicRoutes = ['/', '/api/config', '/api/upload'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Allow access to public routes and API routes
    if (isPublicRoute || pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // For protected routes, check authentication
    if (isProtectedRoute) {
        const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            // No token found, redirect to login
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            // Verify the token
            jwt.verify(token, JWT_SECRET);
            // Token is valid, continue
            return NextResponse.next();
        } catch (error) {
            // Invalid token, redirect to login
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
