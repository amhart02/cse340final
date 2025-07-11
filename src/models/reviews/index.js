import db from '../db.js';

async function addReview({userId, vehicleId, reviewText}) {
    const query = `
    INSERT INTO reviews (user_id, vehicle_id, review_text)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, vehicle_id, review_text, created_at;
    `;

    const values = [ userId, vehicleId, reviewText ];

    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error('Error adding review:', err);
        throw err;
    }
}

export { addReview };