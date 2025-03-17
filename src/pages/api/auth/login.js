// src/pages/api/auth/login.js
import cookie from 'cookie';
import { loginUser } from '../../../lib/auth';

export const POST = async ({ request }) => {
    const formData = await request.formData();

    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/login?error=missing-fields',
            },
        });
    }

    const result = await loginUser({ email, password });

    if (!result.success) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/login?error=invalid',
            },
        });
    }

    // Set cookies for authentication
    const headers = new Headers();
    headers.append('Location', '/dashboard');
    headers.append(
        'Set-Cookie',
        cookie.serialize('token', result.token, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        }),
    );

    headers.append(
        'Set-Cookie',
        cookie.serialize('sessionId', result.sessionId, {
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
