import db from '../db.js';

async function getCategoryBySlug (slug) {
    try {
        const query = 'SELECT * FROM categories WHERE slug = $1';
        const result = await db.query(query, [slug]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching category by slug:', error.message);
        throw error;
    }
}

async function getAllCategories () {
    const result = await db.query(` 
        SELECT * FROM categories
        ORDER BY name;
        `);
    return result.rows;
}

async function editCategory (slug, { name, description }) {
    const newSlug = name.toLowerCase().replace(/\s+/g, '-');

    const query = `
        UPDATE categories 
        SET name = $1, description = $2, slug = $3
        WHERE slug = $4
        RETURNING *;
    `;

    const values = [name, description, newSlug, slug];
    const result = await db.query(query, values);

    return result.rows[0];
}

async function addCategory({ name, description }) {
    const slug = name.toLowerCase().replace(/\s+/g, '-'); 

    const query = `
        INSERT INTO categories (name, description, slug)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [name, description, slug];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function deleteCategory (categoryId) {
    const query = `DELETE FROM categories WHERE id = $1;`;

    const result = await db.query(query, categoryId);
    return result;
}

export { getCategoryBySlug, getAllCategories, editCategory, addCategory, deleteCategory};