import { Router } from 'express';
import { getRandomVehicles, getVehicleById, getVehiclesByCategory } from '../models/vehicles/index.js';
import { getAllCategories, getCategoryBySlug } from '../models/categories/index.js';
import { addReview } from '../models/reviews/index.js'

const router = Router();

router.get('/', async (req, res) => {
        const featuredVehicles = await getRandomVehicles();
        const categories = await getAllCategories();
        const title = "Home";
        res.render('index', { title, featuredVehicles, categories })
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

//review routes
router.get('/review/:category/:id', async (req, res) => {
    const { id, category } = req.params;
    
    const vehicle = await getVehicleById(id);
    const title = `Review ${vehicle.name}`;

    res.render('review', { title, vehicle, category })
})
router.post('/review/:category/:id', async (req, res) => {
    const vehicleId = req.params.id;
    const userId = req.session.user?.id;
    const reviewText = req.body.review;
    const category = req.params.category;

    if (!userId) {
        return res.status(401).send('Please log in to submit a review.');
    }

    if (!reviewText || reviewText.trim().length === 0) {
        return res.status(400).send('Review cannot be empty.');
    }

    try {
        await addReview({ userId, vehicleId, reviewText: reviewText.trim() });
        res.redirect(`/category/${category}/${vehicleId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting review.')
    }
})

export default router;