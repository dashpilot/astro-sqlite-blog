// src/pages/api/posts/update/[id].js
import { updatePost } from '../../../../lib/posts';

export const POST = async ({ request, locals, params }) => {
    const { user } = locals;
    const { id } = params;

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
                Location: `/edit-post/${id}?error=missing-fields`,
            },
        });
    }

    const result = await updatePost({
        id,
        title,
        content,
        published,
        userId: user.id,
    });

    if (!result.success) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: `/edit-post/${id}?error=update-failed`,
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
