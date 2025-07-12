import { Router } from 'express';

import { getRandomVehicles, getVehicleById, getVehiclesByCategory } from '../models/vehicles/index.js';
import { getAllCategories, getCategoryBySlug } from '../models/categories/index.js';
import { createContactMessage, getAllContactMessages } from '../models/contact/index.js';

const router = Router();

router.get('/', async (req, res) => {
    const featuredVehicles = await getRandomVehicles();
    const categories = await getAllCategories();
    const title = "Home";
    res.render('index', { title, featuredVehicles, categories })
})

//contact routes 
router.get('/contact', async (req, res) => {
    const title = 'Contact Us';
    res.render('contact', { title });
})
router.post('/contact', async (req, res) => {
    const { fullName, email, message } = req.body;
    await createContactMessage({ fullName, email, message });
    res.redirect('/contact');
})
router.get('/contact/messages', async (req, res) => {
    const title = 'Messages';
    const messages = await getAllContactMessages();
    res.render('messages', { title, messages });
})

// category routes
router.get('/category/:category', async (req, res, next) => {
    const { category } = req.params;
    const categoryData = await getCategoryBySlug(category);
    const vehicles = await getVehiclesByCategory(categoryData.id);
    const title = categoryData.name;
    if (!categoryData) {
        const error = new Error('Category not found');
        error.status = 404;
        return next(error);
    }
    res.render('category', { title, categoryData, vehicles })
})
router.get('/category/:category/:id', async (req, res) => {
    const { id, category } = req.params;
    const vehicle = await getVehicleById(id);
    const title = vehicle.name; 
    res.render('vehicleDetail', { title, category, vehicle })
})

export default router;