import { Router } from 'express';
import { getAllVehicles, getRandomVehicles, getVehicleById, getVehiclesByCategory, editVehicle, addVehicle } from '../models/vehicles/index.js';
import { getAllCategories, getCategoryBySlug, editCategory, addCategory } from '../models/categories/index.js';
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
    res.render('contact', {title});
})
router.post('/contact', async (req, res) => {
    const { fullName, email, message } = req.body;

    await createContactMessage({ fullName, email, message });
    res.redirect('/contact');
})
router.get('/contact/messages', async (req, res) => {
    const title = 'messages';

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

//review routes

//review routes


//manage vehicle routes 
router.get('/manage/vehicle', async (req, res) => {
    const title = 'Manage Vehicles';
    const vehicles = await getAllVehicles();

    res.render('manage/vehicle', { title, vehicles})
})
router.get('/manage/vehicle/edit/:id', async (req, res) => {
    const vehicleId = req.params.id;
    const title = 'Edit Vehicle';

    const vehicle = await getVehicleById(vehicleId);
    const categories = await getAllCategories();

    res.render('manage/vehicleEdit', { title , vehicle, categories })
})
router.post('/manage/vehicle/edit/:id', async (req, res) => {
    const vehicleId = req.params.id;
    const updatedData = req.body;

    try {
        await editVehicle(vehicleId, updatedData); 
        res.redirect('/manage/vehicle'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update vehicle');
    }
})
router.post('/manage/vehicle/delete/:id', async (req, res) => {
    const vehicleId = req.params.id;

    await deleteVehicle(vehicleId);
    res.redirect('/manage/vehicle');
})
router.get('/manage/vehicle/add', async (req, res) => {
    const title = 'Add a Vehicle';

    const categories = await getAllCategories();

    res.render('manage/vehicleAdd', { title, categories })
})
router.post('/manage/vehicle/add', async (req, res) => {
    const { name, description, price, image, category_id, year } = req.body;
    try {
        await addVehicle({ name, description, price, image, category_id, year });
        res.redirect('/manage/vehicle');
    } catch (err) {
        console.error('Error adding vehicle:', err);
        res.status(500).send('Failed to add vehicle');
    }
})

//manage category routes
router.get('/manage/category', async (req, res) => {
    const title = 'Manage Categories';

    const categories = await getAllCategories();

    res.render('manage/category', { title, categories})
})
router.get('/manage/category/edit/:slug', async (req, res) => {
    const categorySlug = req.params.slug;
    const title = 'Edit Category';

    const category = await getCategoryBySlug(categorySlug);

    res.render('manage/categoryEdit', { title , category })
})
router.post('/manage/category/edit/:slug', async (req, res) => {
    const slug = req.params.slug;
    const { name, description } = req.body;

    try {
        await editCategory(slug, { name, description });
        res.redirect('/manage/category');
    } catch (err) {
        console.error('Failed to update category:', err);
        res.status(500).send('Error updating category');
    }
})
router.post('/manage/category/delete/:id', async (req, res) => {
    const vehicleId = req.params.id;

    await deleteVehicle(vehicleId);
    res.redirect('/manage/category');
})
router.get('/manage/category/add', (req, res) => {
    const title = 'Add a Category'
    res.render('manage/categoryAdd', { title })
})
router.post('/manage/category/add', async (req, res) => {
    const { name, description } = req.body;

    try {
        await addCategory({ name, description });
        res.redirect('/manage/category');
    } catch (err) {
        console.error('Error adding category:', err);
        res.status(500).send('Failed to add category');
    }
})
export default router;