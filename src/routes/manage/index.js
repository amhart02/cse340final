import { Router } from 'express';

import { getAllVehicles, getVehicleById, editVehicle, addVehicle, deleteVehicle } from '../../models/vehicles/index.js';
import { getAllCategories, getCategoryBySlug, editCategory, addCategory } from '../../models/categories/index.js';

const router = Router();

//vehicle manage routes
router.get('/vehicle', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const title = 'Manage Vehicles';
    const vehicles = await getAllVehicles();
    res.render('manage/vehicle', { title, vehicles})
})
router.get('/vehicle/edit/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const vehicleId = req.params.id;
    const title = 'Edit Vehicle';
    const vehicle = await getVehicleById(vehicleId);
    const categories = await getAllCategories();
    res.render('manage/vehicleEdit', { title , vehicle, categories })
})
router.post('/vehicle/edit/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
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
router.post('/vehicle/delete/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const vehicleId = req.params.id;
    await deleteVehicle(vehicleId);
    res.redirect('/manage/vehicle');
})
router.get('/vehicle/add', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const title = 'Add a Vehicle';
    const categories = await getAllCategories();
    res.render('manage/vehicleAdd', { title, categories })
})
router.post('/vehicle/add', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const { name, description, price, image, category_id, year } = req.body;
    try {
        await addVehicle({ name, description, price, image, category_id, year });
        res.redirect('/manage/vehicle');
    } catch (err) {
        console.error('Error adding vehicle:', err);
        res.status(500).send('Failed to add vehicle');
    }
})

//category manage routes
router.get('/category', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const title = 'Manage Categories';
    const categories = await getAllCategories();
    res.render('manage/category', { title, categories})
})
router.get('/category/edit/:slug', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const categorySlug = req.params.slug;
    const title = 'Edit Category';
    const category = await getCategoryBySlug(categorySlug);
    res.render('manage/categoryEdit', { title , category })
})
router.post('/category/edit/:slug', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
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
router.post('/category/delete/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const vehicleId = req.params.id;
    await deleteVehicle(vehicleId);
    res.redirect('/manage/category');
})
router.get('/category/add', (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const title = 'Add a Category'
    res.render('manage/categoryAdd', { title })
})
router.post('/category/add', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
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