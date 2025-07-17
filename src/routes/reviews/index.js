import { Router } from 'express';

import { getVehicleById } from '../../models/vehicles/index.js';
import { addReview, getReviewsByUser, getReviewById, updateReview, deleteReview, getAllReviews } from '../../models/reviews/index.js';

const router = Router();


router.get('/', async (req, res) => {
    const title = 'My Reviews';
    const userId = req.session.user?.id;
        // if (!req.session.isLoggedIn) {
        // req.flash('error', 'Please log in to access the dashboard');
        // return res.render('accounts/login', {
        // title: 'Login'
        // });
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    try {
        const reviews = await getReviewsByUser(userId);
        res.render('reviews/reviews', { title , reviews, userId })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving your reviews');
    }
})

router.get('/edit/:reviewId', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const title = 'Edit Review';
    const reviewId = req.params.reviewId;
    const review = await getReviewById(reviewId);
    res.render('reviews/edit', { title, review})
});
router.post('/edit/:reviewId', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const reviewId = req.params.reviewId;
    const updatedText = req.body.review;
    await updateReview(reviewId, updatedText);
    res.redirect('/reviews');
});
router.post('/delete/:reviewId', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        req.flash('error', "You must be logged in to delete a review");
        return res.redirect('/')
    };
    const reviewId = req.params.reviewId;
    const userRole = req.session.user?.role_name;
    try {
        await deleteReview(reviewId);
        req.flash('success', 'Review Deleted');
        if (userRole === "user") {
            res.redirect('/');
        } else {
            res.redirect('/reviews');
        }
    } catch (error) {
        req.flash('error', 'Failed to delete review.');
        return res.redirect('/reviews');
    }
})
router.get('/manage', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const reviews = await getAllReviews();
    const title = 'Manage Reviews';
    res.render('reviews/manage', { title, reviews})
})

router.get('/:category/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
    const { id, category } = req.params;
    const vehicle = await getVehicleById(id);
    const title = `Review ${vehicle.name}`;
    res.render('reviews/review', { title, vehicle, category })
})
router.post('/:category/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        console.log('Unauthorized Access')
        return res.redirect('/')
    };
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