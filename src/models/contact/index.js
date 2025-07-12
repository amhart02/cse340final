import db from '../db.js';

async function createContactMessage({fullName, email, message}) {
    const query = `
    INSERT INTO contact_messages (name, email, message)
    VALUES ($1, $2, $3)
    RETURNING id, created_at;
    `

    const values = [ fullName, email, message]

    const result = await db.query(query, values);
    return result.rows[0];
}

async function getAllContactMessages() {
    const query =  `SELECT * FROM contact_messages`;

    const result = await db.query(query);
    return result.rows;
}

export { createContactMessage, getAllContactMessages };