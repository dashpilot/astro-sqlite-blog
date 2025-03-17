// src/lib/posts.js
import { db } from './db';
import { generateId } from './auth';

// Create a slug from a title
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Create a new post
export async function createPost({ title, content, userId, published = false }) {
    const postId = generateId();
    const slug = createSlug(title);

    try {
        await db.execute({
            sql: `INSERT INTO posts (id, title, slug, content, published, user_id) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            args: [postId, title, slug, content, published ? 1 : 0, userId],
        });

        return { success: true, postId, slug };
    } catch (error) {
        console.error('Error creating post:', error);
        return { success: false, error: error.message };
    }
}

// Get all posts (with optional filter for published only)
export async function getAllPosts(publishedOnly = false) {
    try {
        let sql = `
      SELECT p.*, u.name as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;

        if (publishedOnly) {
            sql += ` WHERE p.published = 1`;
        }

        sql += ` ORDER BY p.created_at DESC`;

        const result = await db.execute(sql);
        return result.rows;
    } catch (error) {
        console.error('Error getting posts:', error);
        return [];
    }
}

// Get posts by user
export async function getPostsByUser(userId) {
    try {
        const result = await db.execute({
            sql: `
        SELECT * FROM posts
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
            args: [userId],
        });

        return result.rows;
    } catch (error) {
        console.error('Error getting user posts:', error);
        return [];
    }
}

// Get a post by slug
export async function getPostBySlug(slug) {
    try {
        const result = await db.execute({
            sql: `
        SELECT p.*, u.name as author_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.slug = ?
      `,
            args: [slug],
        });

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error getting post by slug:', error);
        return null;
    }
}

// Update a post
export async function updatePost({ id, title, content, published, userId }) {
    try {
        // First check if the user owns this post
        const checkResult = await db.execute({
            sql: `SELECT id FROM posts WHERE id = ? AND user_id = ?`,
            args: [id, userId],
        });

        if (checkResult.rows.length === 0) {
            return { success: false, error: "Post not found or you don't have permission" };
        }

        // Generate a new slug if title changed
        let slug;
        if (title) {
            slug = createSlug(title);
        }

        // Build the update query dynamically based on provided fields
        const updates = [];
        const args = [];

        if (title) {
            updates.push('title = ?');
            args.push(title);
        }

        if (slug) {
            updates.push('slug = ?');
            args.push(slug);
        }

        if (content !== undefined) {
            updates.push('content = ?');
            args.push(content);
        }

        if (published !== undefined) {
            updates.push('published = ?');
            args.push(published ? 1 : 0);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');

        // Add the post ID to args
        args.push(id);

        await db.execute({
            sql: `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
            args,
        });

        return { success: true, slug };
    } catch (error) {
        console.error('Error updating post:', error);
        return { success: false, error: error.message };
    }
}

// Delete a post
export async function deletePost(id, userId) {
    try {
        // First check if the user owns this post
        const checkResult = await db.execute({
            sql: `SELECT id FROM posts WHERE id = ? AND user_id = ?`,
            args: [id, userId],
        });

        if (checkResult.rows.length === 0) {
            return { success: false, error: "Post not found or you don't have permission" };
        }

        await db.execute({
            sql: `DELETE FROM posts WHERE id = ?`,
            args: [id],
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting post:', error);
        return { success: false, error: error.message };
    }
}
