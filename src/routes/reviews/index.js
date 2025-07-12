console.log('Reviews router loaded');

import { Router } from 'express';

import { getVehicleById } from '../../models/vehicles/index.js';
import { addReview, getReviewsByUser, getReviewById, updateReview, deleteReview, getAllReviews } from '../../models/reviews/index.js';

const router = Router();


router.get('/', async (req, res) => {
    const userId = req.session.user?.id;

    if (!userId) {
        return res.redirect('/account/login');
    }

    try {
        const reviews = await getReviewsByUser(userId);
        res.render('reviews/reviews', { title: 'My Reviews', reviews, userId })

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving your reviews');
    }
})

router.get('/edit/:reviewId', async (req, res) => {
    const reviewId = req.params.reviewId;

    const review = await getReviewById(reviewId);
    res.render('reviews/edit', { title: 'Edit Review', review})
});
router.post('/edit/:reviewId', async (req, res) => {
    const reviewId = req.params.reviewId;
    const updatedText = req.body.review;

    await updateReview(reviewId, updatedText);
    res.redirect('/reviews');
});
router.post('/delete/:reviewId', async (req, res) => {
    const reviewId = req.params.reviewId;
    const userRole = req.session.user?.role_name;

    await deleteReview(reviewId);
    if (userRole === "user") {
        res.redirect('/');
    } else {
        res.redirect('/manage');
    }
})
router.get('/manage', async (req, res) => {
    const reviews = await getAllReviews();
    const title = 'Manage Reviews';
    res.render('reviews/manage', { title, reviews})
})

router.get('/:category/:id', async (req, res) => {
    const { id, category } = req.params;
    
    const vehicle = await getVehicleById(id);
    const title = `Review ${vehicle.name}`;

    res.render('reviews/review', { title, vehicle, category })
})
router.post('/:category/:id', async (req, res) => {
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