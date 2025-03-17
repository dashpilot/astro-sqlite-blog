// src/middleware.js
import { defineMiddleware } from 'astro:middleware';
import cookie from 'cookie';
import { getUserFromToken, validateSession } from './lib/auth';

export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
    // Parse cookies
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    const token = cookies.token;
    const sessionId = cookies.sessionId;

    // Set default auth state
    locals.user = null;
    locals.isLoggedIn = false;

    // Protected routes patterns
    const protectedRoutes = ['/dashboard', '/create-post', '/edit-post'];

    // Public routes that should redirect logged-in users
    const authRoutes = ['/login', '/register'];

    const url = new URL(request.url);
    const pathname = url.pathname;

    // If there's a token, try to get the user
    if (token && sessionId) {
        // Validate session first
        const isValidSession = await validateSession(sessionId);

        if (isValidSession) {
            const user = await getUserFromToken(token);
            if (user) {
                locals.user = user;
                locals.isLoggedIn = true;

                // Redirect from auth routes if already logged in
                if (authRoutes.some((route) => pathname.startsWith(route))) {
                    return new Response(null, {
                        status: 302,
                        headers: {
                            Location: '/dashboard',
                        },
                    });
                }
            }
        }
    }

    // Check for protected routes when not logged in
    if (!locals.isLoggedIn && protectedRoutes.some((route) => pathname.startsWith(route))) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/login',
            },
        });
    }

    return next();
});
