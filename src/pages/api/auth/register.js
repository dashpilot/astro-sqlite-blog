// src/pages/api/auth/register.js
import { registerUser, loginUser } from '../../../lib/auth';
import cookie from 'cookie';

export const POST = async ({ request }) => {
    const formData = await request.formData();

    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    if (!name || !email || !password) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/register?error=missing-fields',
            },
        });
    }

    // Password validation
    if (password.length < 8) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/register?error=weak-password',
            },
        });
    }

    // Register the user
    const registerResult = await registerUser({ name, email, password });

    if (!registerResult.success) {
        // Check if email already exists
        if (registerResult.error.includes('UNIQUE constraint failed')) {
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/register?error=email-exists',
                },
            });
        }

        return new Response(null, {
            status: 302,
            headers: {
                Location: '/register?error=registration-failed',
            },
        });
    }

    // Auto login after registration
    const loginResult = await loginUser({ email, password });

    if (!loginResult.success) {
        // This shouldn't happen, but just in case
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/login?message=registered',
            },
        });
    }

    // Set cookies for authentication
    const headers = new Headers();
    headers.append('Location', '/dashboard');
    headers.append(
        'Set-Cookie',
        cookie.serialize('token', loginResult.token, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        }),
    );

    headers.append(
        'Set-Cookie',
        cookie.serialize('sessionId', loginResult.sessionId, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        }),
    );

    return new Response(null, {
        status: 302,
        headers,
    });
};
