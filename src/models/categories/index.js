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

async function getProductsByCategory(categoryId) {
    // TODO: Implement products table and functionality in future assignment
    console.log(`Mock: Getting products for category ID ${categoryId}`);
    return [];
}

async function getAllCategories () {
    const result = await db.query(` 
        SELECT * FROM categories
        ORDER BY name;
        `);
    return result.rows;
}

export { getCategoryBySlug, getProductsByCategory, getAllCategories };