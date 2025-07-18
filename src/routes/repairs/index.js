import { Router } from 'express';

import {getAllRequests, getRequestById, editRequest, getRequestByUser, createRepairRequest } from '../../models/repairs/index.js'

const router = Router();

// user 
router.get('/', async (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const title = 'Your Repair Requests';
    const userId = req.session.user?.id;
    try {
        const requests = await getRequestByUser(userId);
        res.render('repair/repairs', { title, requests })
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to load your repair requests.')
        res.redirect('/account/dashboard')
    }
})
router.get('/create', async (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const title = "Create Repair Request";
    res.render('repair/repair', { title });
})
router.post('/create', async (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const { vehicleName, description } = req.body;
    const userId = req.session.user?.id;

    if (!vehicleName || !description || 
    vehicleName.trim().length === 0 || 
    description.trim().length === 0) {
        req.flash('error', 'Both vehicle name and description are required.')
        return res.redirect('/repair/create');
    }
    try {
        await createRepairRequest({ userId, vehicleName, description });
        req.flash('success', 'Repair request submitted!')
        res.redirect('/repair');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to create repair request.')
        res.redirect('/repair/create');
    }
})

//employee 
router.get('/manage', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const title = 'Manage Repair Requests';
    
    try {
        const requests = await getAllRequests();
        res.render('repair/manage', { title, requests})
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to load repair requests.')
        res.redirect('/account/dashboard')
    }
})
router.get('/edit/:id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const repairId = req.params.id;
    const title = 'Update Repair Request';
    try {
        const repair = await getRequestById(repairId);
        if (!repair) {
            req.flash('error', "Repair request not found.")
            return res.redirect('/repair/manage');
        }
        res.render('repair/edit', { title , repair })
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to load repair request.')
        res.redirect('/repair/manage');
    }
})
router.post('/edit/:id', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    const repairId = req.params.id;
    const status = req.body.status;

    if (!status || status.trim().length === 0) {
        req.flash('error', "Status is required.")
        return res.redirect(`/repair/edit/${repairId}`);
    }

    try {
        await editRequest(repairId, status); 
        req.flash('success', 'Repair request updated!')
        res.redirect('/repair/manage'); 
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to update repair request.')
        res.redirect(`/repair/edit/${repairId}`);
    }
})

export default router;