// src/pages/api/posts/create.js
import { createPost } from '../../../lib/posts';

export const POST = async ({ request, locals }) => {
    const { user } = locals;

    if (!user) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/login',
            },
        });
    }

    const formData = await request.formData();

    const title = formData.get('title');
    const content = formData.get('content');
    const published = formData.get('published') === '1';

    if (!title || !content) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/create-post?error=missing-fields',
            },
        });
    }

    const result = await createPost({
        title,
        content,
        userId: user.id,
        published,
    });

    if (!result.success) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/create-post?error=creation-failed',
            },
        });
    }

    return new Response(null, {
        status: 302,
        headers: {
            Location: '/dashboard',
        },
    });
};
