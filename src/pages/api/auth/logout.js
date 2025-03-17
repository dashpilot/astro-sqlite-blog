// src/pages/api/auth/logout.js
import cookie from 'cookie';
import { logoutUser } from '../../../lib/auth';

export const POST = async ({ request }) => {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    const sessionId = cookies.sessionId;

    // Invalidate the session in the database
    await logoutUser(sessionId);

    // Clear cookies
    const headers = new Headers();
    headers.append('Location', '/');
    headers.append(
        'Set-Cookie',
        cookie.serialize('token', '', {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        }),
    );

    headers.append(
        'Set-Cookie',
        cookie.serialize('sessionId', '', {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        }),
    );

    return new Response(null, {
        status: 302,
        headers,
    });
};
