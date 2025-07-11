import db from '../db.js';

async function getAllVehicles() {
    try {
        const query = 'SELECT * FROM vehicles ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching vehicles:', error.message);
        throw error;
    }
}

async function getVehicleById(id) {
    try {
        const query = 'SELECT * FROM vehicles WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching vehicle by ID:', error.message);
        throw error;
    }
}

async function getVehiclesByCategory (category) {
    try {
        const query = 'SELECT * FROM vehicles WHERE category_id = $1';
        const result = await db.query(query, [category]);
        return result.rows || null;
    } catch (error) {
        console.error('Error fetching vehicles by category:', error.message);
        throw error;
    }
}

async function addVehicle(vehicleData) {
    try {
        const query = `
            INSERT INTO vehicles (name, description, price, image, category_id, year)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [
            vehicleData.name,
            vehicleData.description,
            vehicleData.price,
            vehicleData.image,
            vehicle.year
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding Vehicle:', error.message);
        throw error;
    }
};

async function getRandomVehicles () {
    const result = await db.query(`
        SELECT * FROM vehicles
        ORDER BY RANDOM()
        LIMIT 3
        `);
        return result.rows;
}

export { getAllVehicles, getVehicleById, getVehiclesByCategory, addVehicle, getRandomVehicles };