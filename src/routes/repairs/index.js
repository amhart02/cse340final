import { Router } from 'express';

import {getAllRequests, getRequestById, editRequest, getRequestByUser, createRepairRequest } from '../../models/repairs/index.js'

const router = Router();

// user 
router.get('/', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const title = 'Your Repair Requests';
    const userId = req.session.user?.id;
    const requests = await getRequestByUser(userId);
    console.log(requests); 
    res.render('repair/repairs', { title, requests })
})
router.get('/create', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const title = "Create Repair Request";
    res.render('repair/repair', { title });
})
router.post('/create', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const { vehicleName, description } = req.body;
    const userId = req.session.user?.id;
    await createRepairRequest({ userId, vehicleName, description });
    res.redirect('/repair');
})

//employee 
router.get('/manage', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const title = 'Manage Repair Requests';
    const requests = await getAllRequests();
    res.render('repair/manage', { title, requests})
})
router.get('/edit/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const repairId = req.params.id;
    const title = 'Update Repair Request';
    const repair = await getRequestById(repairId);
    res.render('repair/edit', { title , repair })
})
router.post('/edit/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const repairId = req.params.id;
    const status = req.body.status;
    try {
        await editRequest(repairId, status); 
        res.redirect('/repair/manage'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update repair');
    }
})

export default router;