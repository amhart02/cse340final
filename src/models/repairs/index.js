import db from '../db.js';

async function getAllRequests () {
    const query = `SELECT * FROM repair_requests`;

    const results = await db.query(query);
    return results.rows;
}

async function getRequestById (repairId) {
    const query = `SELECT * 
    FROM repair_requests
    WHERE id = $1`;

    const results = await db.query(query, [repairId]);
    return results.rows[0];
}

async function editRequest (repairId, status) {
    const existing = await getRequestById(repairId);
    if (!existing) throw new Error('Request not found');

    const query = `
        UPDATE repair_requests
        SET status = $1
        WHERE id = $2
        RETURNING *;
    `;

    const values = [ status, repairId ]

    const result = await db.query(query, values);
    return result.rows[0];
}

async function getRequestByUser(userId) {
    const query = `
    SELECT *
    FROM repair_requests
    WHERE user_id = $1
    ORDER BY created_at DESC`;

    const result = await db.query(query, [userId]);
    return result.rows;
}

async function createRepairRequest ({ userId, vehicleName, description}) {
    const query = `
    INSERT INTO repair_requests (user_id, vehicle_name, description)
    VALUES ($1, $2, $3)
    RETURNING id, vehicle_name, user_id, description, status, created_at;
    `;

    const values = [ userId, vehicleName, description]

    const results = await db.query(query, values);

    return results.rows[0];
}

export { getAllRequests, getRequestById, editRequest, getRequestByUser, createRepairRequest };