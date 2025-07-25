import db from '../db.js';
import bcrypt from 'bcrypt';

const saltRounds = 12;

async function createUser(userData) {
    try {
        const { email, password } = userData;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query =  `
        INSERT INTO users (email, password, role_id)
        VALUES ($1, $2, $3)
        RETURNING id, email, role_id, created_at;
        `;

        const values = [email, hashedPassword, 0];
        const result = await db.query(query, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw new Error('Failed to create user');
    };
}

async function getUserByEmail(email) {
    try {
        const query = `
            SELECT u.id, u.email, u.password, u.role_id, u.created_at, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1;
        `;
        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching user by email:', error.message);
        throw new Error('Failed to fetch user');
    }
}

async function authenticateUser(email, password) {
    try {
        const user = await getUserByEmail(email);

        if (!user) {
            await bcrypt.hash(password, saltRounds);
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            const { password: _, ...userWithoutPassword } = user;

            userWithoutPassword.role_id = parseInt(userWithoutPassword.role_id, 10);
            return userWithoutPassword;
        }

        return null;
    } catch (error) {
        console.error('Error authenticating user:', error.message);
        throw new Error('Authentication failed');
    }
}

async function emailExists(email) {
    try {
        const query = 'SELECT id FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking email existence:', error.message);
        throw new Error('Failed to check email existence');
    }
}

async function updateEmail (userId, newEmail) {
    try {
        const query =  `
        UPDATE users
        SET email = $1
        WHERE id = $2
        RETURNING id, email, role_id, created_at;
        `;

        const values = [newEmail, userId];
        const result = await db.query(query, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw new Error('Failed to update email');
    };
}

async function updatePassword (userId, newPassword) {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const query =  `
            UPDATE users
            SET password = $1
            WHERE id = $2
            RETURNING id, email, role_id, created_at;
        `;

        const values = [hashedPassword, userId];
        const result = await db.query(query, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw new Error('Failed to update password');
    };
}

export { createUser, getUserByEmail, authenticateUser, emailExists, updateEmail, updatePassword };