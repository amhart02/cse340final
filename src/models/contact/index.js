import db from '../db.js';

async function createContactMessage({fullName, email, message}) {
    const query = `
        INSERT INTO contact_messages (name, email, message)
        VALUES ($1, $2, $3)
        RETURNING id, created_at;
    `;
    const values = [fullName, email, message];

    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error('Error creating contact message:', err);
        throw new Error('Could not send your message. Please try again later.');
    }
}

async function getAllContactMessages() {
    const query = `SELECT * FROM contact_messages`;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (err) {
        console.error('Error fetching contact messages:', err);
        throw new Error('Could not retrieve contact messages.');
    }
}

export { createContactMessage, getAllContactMessages };