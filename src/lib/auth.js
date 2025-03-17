// src/lib/auth.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db';
import crypto from 'crypto';

// This should be in an environment variable in production
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Generate a unique ID
export function generateId() {
    return crypto.randomUUID();
}

// Hash password
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Compare password with hash
export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Create a JWT token
export function createToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// User registration
export async function registerUser({ name, email, password }) {
    const userId = generateId();
    const password_hash = await hashPassword(password);

    try {
        await db.execute({
            sql: `INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)`,
            args: [userId, name, email, password_hash],
        });

        return { success: true, userId };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

// User login
export async function loginUser({ email, password }) {
    try {
        const result = await db.execute({
            sql: `SELECT id, password_hash FROM users WHERE email = ?`,
            args: [email],
        });

        if (result.rows.length === 0) {
            return { success: false, error: 'Invalid email or password' };
        }

        const user = result.rows[0];
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Create session
        const sessionId = generateId();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        await db.execute({
            sql: `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`,
            args: [sessionId, user.id, expiresAt.toISOString()],
        });

        const token = createToken(user.id);

        return {
            success: true,
            userId: user.id,
            sessionId,
            token,
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Get user from token
export async function getUserFromToken(token) {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    try {
        const result = await db.execute({
            sql: `SELECT id, name, email FROM users WHERE id = ?`,
            args: [decoded.userId],
        });

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Check session validity
export async function validateSession(sessionId) {
    if (!sessionId) return false;

    try {
        const result = await db.execute({
            sql: `SELECT id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP`,
            args: [sessionId],
        });

        return result.rows.length > 0;
    } catch (error) {
        console.error('Session validation error:', error);
        return false;
    }
}

// Logout user (invalidate session)
export async function logoutUser(sessionId) {
    if (!sessionId) return;

    try {
        await db.execute({
            sql: `DELETE FROM sessions WHERE id = ?`,
            args: [sessionId],
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
}
