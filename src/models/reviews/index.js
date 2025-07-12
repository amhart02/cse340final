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

async function getAllReviews () {
    const query = `
    SELECT r.*, v.name AS vehicle_name, u.email AS user_email
        FROM reviews r
        JOIN vehicles v ON r.vehicle_id = v.id
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `;

    const result = await db.query(query);
    return result.rows;
}

async function getReviewsByUser(userId) {
    const query = `
    SELECT r.id, r.review_text, r.created_at, v.name
    FROM reviews r
    JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC`;

    const result = await db.query(query, [userId]);
    return result.rows;
}

async function getReviewById(reviewId) {
    const query = `SELECT r.id, r.review_text, r.created_at, r.user_id, r.vehicle_id, v.name AS vehicle_name 
    FROM reviews r 
    JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.id = $1`;
    const result = await db.query(query, [reviewId]);
    return result.rows[0];
}

async function updateReview(reviewId, newText) {
    const query = `UPDATE reviews SET review_text = $1 WHERE id = $2`;
    await db.query(query, [newText, reviewId]);
}

async function deleteReview(reviewId) {
    const query = `DELETE FROM reviews WHERE id = $1`;
    await db.query(query, [reviewId]);
}

export { addReview, getReviewsByUser, getReviewById, updateReview, deleteReview, getAllReviews };