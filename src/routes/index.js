import { Router } from 'express';

import { getRandomVehicles, getVehicleById, getVehiclesByCategory } from '../models/vehicles/index.js';
import { getAllCategories, getCategoryBySlug } from '../models/categories/index.js';
import { createContactMessage, getAllContactMessages } from '../models/contact/index.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const featuredVehicles = await getRandomVehicles();
        const categories = await getAllCategories();
        const title = "Home";
        res.render('index', { title, featuredVehicles, categories })
    } catch (error) {
        req.flash('error', 'Something went wrong loading the homepage.')
        res.redirect('/')
    }
})

//contact routes 
router.get('/contact', async (req, res) => {
    const title = 'Contact Us';
    res.render('contact', { title });
})
router.post('/contact', async (req, res) => {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
        req.flash("error", 'All fields are required.');
        return res.redirect('/contact');
    }
    try {
        await createContactMessage({ fullName, email, message });
        req.flash('success', 'Thanks for reaching out! We\'ll be in touch soon.')
        res.redirect('/contact');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong. Please try again later.');
        res.redirect('/contact');
    }
})
router.get('/contact/messages', async (req, res) => {
    const title = 'Messages';

    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }

    try {
        const messages = await getAllContactMessages();
        res.render('messages', { title, messages });
    } catch (error) {
        console.log(error);
        req.flash('error', 'Could not load messages.')
    }
})

// category routes
router.get('/category/:category', async (req, res, next) => {
    const { category } = req.params;

    try {
        const categoryData = await getCategoryBySlug(category);
        if (!categoryData) {
            req.flash('error', 'Category not found.')
            return res.redirect('/');
        }
        const vehicles = await getVehiclesByCategory(categoryData.id);
        const title = categoryData.name;
        res.render('category', { title, categoryData, vehicles })
    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong.')
        res.redirect('/');
    }
})
router.get('/category/:category/:id', async (req, res) => {
    const { id, category } = req.params;

    try {
        const vehicle = await getVehicleById(id);
        if (!vehicle) {
            req.flash('error', 'Vehicle not found.')
            return res.redirect(`/category/${category}`);
        }
        const title = vehicle.name; 
        res.render('vehicleDetail', { title, category, vehicle })
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to load vehicle details.')
    }
})

export default router;