import { Router } from 'express';
import { getRandomVehicles, getVehicleById, getVehiclesByCategory } from '../models/vehicles/index.js';
import { getAllCategories, getCategoryBySlug } from '../models/categories/index.js';

const router = Router();

router.get('/', async (req, res) => {
        const featuredVehicles = await getRandomVehicles();
        const categories = await getAllCategories();
        const title = "Home";
        res.render('index', { title, featuredVehicles, categories })
})

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
    const { id } = req.params;
    
    const vehicle = await getVehicleById(id);
    const title = vehicle.name; 

    res.render('vehicleDetail', { title, vehicle })
})

router.get('/register', (req, res) => {
    const title = "register";
    res.render('register', { title })
})

router.get('/login', (req, res) => {
    const title = "login";
    res.render('login', { title })
})

export default router;