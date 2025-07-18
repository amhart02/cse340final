import { Router } from 'express';

import { getAllVehicles, getVehicleById, editVehicle, addVehicle, deleteVehicle, getVehiclesByCategory } from '../../models/vehicles/index.js';
import { getAllCategories, getCategoryBySlug, editCategory, addCategory, deleteCategory } from '../../models/categories/index.js';

const router = Router();

//vehicle manage routes
router.get('/vehicle', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const title = 'Manage Vehicles';
    const vehicles = await getAllVehicles();
    res.render('manage/vehicle', { title, vehicles})
})
router.get('/vehicle/edit/:id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const vehicleId = req.params.id;
    const title = 'Edit Vehicle';
    const vehicle = await getVehicleById(vehicleId);
    const categories = await getAllCategories();

    if (!vehicle) {
        req.flash('error', 'Vehicle not found.')
        return res.redirect('/manage/vehicle');
    }
    res.render('manage/vehicleEdit', { title , vehicle, categories });
})
router.post('/vehicle/edit/:id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const vehicleId = req.params.id;
    const { name, description, price, image, category_id, year } = req.body;

    if (!name || !description || !price || !category_id || !year) {
        req.flash('error', 'Please fill out all required fields.');
        return res.redirect(`/manage/vehicle/edit/${vehicleId}`);
    }
    if (isNaN(Number(price)) || isNaN(Number(year))) {
        req.flash('error', 'Price and year must be numbers.');
        return res.redirect(`/manage/vehicle/edit/${vehicleId}`);
    }

    try {
        await editVehicle(vehicleId, { name, description, price, image, category_id, year }); 
        req.flash('success', 'Vehicle updated successfully.')
        res.redirect('/manage/vehicle'); 
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to update vehicle.');
        res.redirect(`/manage/vehicle/edit/${vehicleId}`)
    }
})
router.post('/vehicle/delete/:id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const vehicleId = req.params.id;
    try {
        await deleteVehicle(vehicleId);
        req.flash('success', 'Vehicle deleted successfully.')
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to delete vehicle.');
    }
    res.redirect('/manage/vehicle');
})
router.get('/vehicle/add', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const title = 'Add a Vehicle';
    const categories = await getAllCategories();
    res.render('manage/vehicleAdd', { title, categories })
})
router.post('/vehicle/add', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const { name, description, price, image, category_id, year } = req.body;
    if (!name || !description || !price || !category_id || !year) {
        req.flash('error', 'Please fill out all required fields.');
        return res.redirect('/manage/vehicle/add');
    }
    if (isNaN(Number(price)) || isNaN(Number(year))) {
        req.flash('error', 'Price and year must be valid numbers.');
        return res.redirect('/manage/vehicle/add');
    }
    try {
        await addVehicle({ name, description, price, image, category_id, year });
        req.flash('success', 'Vehicle added successfully!')
        res.redirect('/manage/vehicle');
    } catch (err) {
        console.log(error);
        req.flash('error', 'Failed to add vehicle')
        res.redirect('/manage/vehicle/add');
    }
})

//category manage routes
router.get('/category', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const title = 'Manage Categories';
    const categories = await getAllCategories();
    res.render('manage/category', { title, categories})
})
router.get('/category/edit/:slug', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const categorySlug = req.params.slug;
    const title = 'Edit Category';
    const category = await getCategoryBySlug(categorySlug);

    if (!category) {
        req.flash('error', 'Category not found');
        return res.redirect('/manage/category');
    }
    res.render('manage/categoryEdit', { title , category })
})
router.post('/category/edit/:slug', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const slug = req.params.slug;
    const { name, description } = req.body;
    if (!name || !description) {
        req.flash('error', 'Please fill out all required fields.')
        return res.redirect(`/manage/category/edit/${slug}`);
    }
    try {
        await editCategory(slug, { name, description });
        req.flash('success', 'Category updated successfully.');
        res.redirect('/manage/category');
    } catch (err) {
        console.error('Failed to update category:', err);
        req.flash('error', 'Error updating category.');
        res.redirect(`/manage/category/edit/${slug}`);
    }
})
router.post('/category/delete/:id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const categoryId = req.params.id;
    try {
        const vehicles = await getVehiclesByCategory(categoryId);

        if (vehicles.length > 0) {
            req.flash('error', 'Cannot delete category. There are vehicles assigned to it.')
        }
        await deleteCategory(categoryId);
        req.flash('success', 'Category deleted successfully!')
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to delete category.');
    }
    res.redirect('/manage/category');
})
router.get('/category/add', (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const title = 'Add a Category'
    res.render('manage/categoryAdd', { title })
})
router.post('/category/add', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const { name, description } = req.body;
    try {
        await addCategory({ name, description });
        req.flash('success', 'Categpry added successfully!')
        res.redirect('/manage/category');
    } catch (err) {
        console.error('Error adding category:', err);
        req.flash('error', 'Failed to add category.')
        res.redirect('/manage/category')
    }
})

export default router;