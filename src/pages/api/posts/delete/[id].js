// src/pages/api/posts/delete/[id].js
import { deletePost } from '../../../../lib/posts';

export const POST = async ({ locals, params }) => {
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

    const result = await deletePost(id, user.id);

    if (!result.success) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/dashboard?error=delete-failed',
            },
        });
    }

    return new Response(null, {
        status: 302,
        headers: {
            Location: '/dashboard?message=post-deleted',
        },
    });
};
