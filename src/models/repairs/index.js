import db from '../db.js';

async function getAllRequests () {
    const query = `SELECT * FROM repair_requests`;
    try {
        const results = await db.query(query);
        return results.rows;
    } catch (err) {
        console.error('Error fetching all repair requests:', err);
        throw new Error('Could not retrieve repair requests');
    }
}

async function getRequestById (repairId) {
    const query = `SELECT * FROM repair_requests WHERE id = $1`;
    try {
        const results = await db.query(query, [repairId]);
        return results.rows[0];
    } catch (err) {
        console.error(`Error fetching request with ID ${repairId}:`, err);
        throw new Error('Could not retrieve the repair request');
    }
}

async function editRequest (repairId, status) {
    try {
        const existing = await getRequestById(repairId);
        if (!existing) throw new Error('Request not found');

        const query = `
            UPDATE repair_requests
            SET status = $1
            WHERE id = $2
            RETURNING *;
        `;
        const values = [ status, repairId ];
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error(`Error updating request with ID ${repairId}:`, err);
        throw new Error('Could not update the repair request');
    }
}

async function getRequestByUser(userId) {
    const query = `
        SELECT *
        FROM repair_requests
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    try {
        const result = await db.query(query, [userId]);
        return result.rows;
    } catch (err) {
        console.error(`Error fetching requests for user ID ${userId}:`, err);
        throw new Error('Could not retrieve repair requests for this user');
    }
}

async function createRepairRequest ({ userId, vehicleName, description}) {
    const query = `
        INSERT INTO repair_requests (user_id, vehicle_name, description)
        VALUES ($1, $2, $3)
        RETURNING id, vehicle_name, user_id, description, status, created_at;
    `;
    const values = [ userId, vehicleName, description ];
    try {
        const results = await db.query(query, values);
        return results.rows[0];
    } catch (err) {
        console.error('Error creating repair request:', err);
        throw new Error('Could not create repair request');
    }
}

export { getAllRequests, getRequestById, editRequest, getRequestByUser, createRepairRequest };