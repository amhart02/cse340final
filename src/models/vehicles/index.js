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
            INSERT INTO vehicles (name, description, price, image, category_id, year, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [
            vehicleData.name,
            vehicleData.description,
            vehicleData.price,
            vehicleData.image,
            vehicleData.category_id,
            vehicleData.year,
            'available'
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding Vehicle:', error.message);
        throw error;
    }
};

async function getRandomVehicles () {
    try {
        const result = await db.query(`
            SELECT * FROM vehicles
            ORDER BY RANDOM()
            LIMIT 3
        `);
        return result.rows;
    } catch (error) {
        console.error('Error fetching random vehicles:', error.message);
        throw new Error('Failed to fetch random vehicles');
    }
}

async function editVehicle(vehicleId, updatedData) {
    try {
        const existing = await getVehicleById(vehicleId);
        if (!existing) throw new Error('Vehicle not found');

        const merged = {
            name: updatedData.name || existing.name,
            description: updatedData.description || existing.description,
            price: updatedData.price || existing.price,
            image: updatedData.image || existing.image,
            category_id: updatedData.category_id || existing.category_id,
            year: updatedData.year || existing.year,
            status: updatedData.status || existing.status
        };

        const query = `
            UPDATE vehicles
            SET name = $1,
                description = $2,
                price = $3,
                image = $4,
                category_id = $5,
                year = $6,
                status = $7
            WHERE id = $8
            RETURNING *;
        `;
        const values = [
            merged.name,
            merged.description,
            merged.price,
            merged.image,
            merged.category_id,
            merged.year,
            merged.status,
            vehicleId,
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error editing vehicle:', error.message);
        throw new Error('Failed to edit vehicle');
    }
}

async function deleteVehicle (vehicleId) {
    try {
        const query = `DELETE FROM vehicles WHERE id = $1`;
        await db.query(query, [vehicleId]);
    } catch (error) {
        console.error('Error deleting vehicle:', error.message);
        throw new Error('Failed to delete vehicle');
    }
}


export { getAllVehicles, getVehicleById, getVehiclesByCategory, addVehicle, getRandomVehicles, editVehicle, deleteVehicle };