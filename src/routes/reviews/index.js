import { Router } from 'express';

import { getVehicleById } from '../../models/vehicles/index.js';
import { addReview, getReviewsByUser, getReviewById, updateReview, deleteReview, getAllReviews } from '../../models/reviews/index.js';

const router = Router();


router.get('/', async (req, res) => {
    const title = 'My Reviews';
    const userId = req.session.user?.id;

    if (!req.session.isLoggedIn) {
        req.flash('error', 'You must be logged in to view your reviews.')
        return res.redirect('/');
    }

    try {
        const reviews = await getReviewsByUser(userId);
        res.render('reviews/reviews', { title , reviews, userId })
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error retrieving your reviews.')
        res.redirect('/');
    }
})

router.get('/edit/:reviewId', async (req, res) => {
    const title = 'Edit Review';
    const reviewId = req.params.reviewId;

    if (!req.session.isLoggedIn) {
        req.flash('error', 'You must be logged in to edit your reviews.')
        return res.redirect('/')
    }
    try {
        const review = await getReviewById(reviewId);
        if (!review) {
            req.flash('error', 'Review not found.')
            return res.redirect('/reviews');
        }
        res.render('reviews/edit', { title, review})
    } catch (error) {
        console.log(error);
        req.flash('error', "Error retrieving reviews.")
        res.redirect('/');
    }
});
router.post('/edit/:reviewId', async (req, res) => {
    const reviewId = req.params.reviewId;
    const updatedText = req.body.review;

    if (!req.session.isLoggedIn) {
        req.flash('error', 'You must be logged in to edit a review.')
        return res.redirect('/')
    }
    if ( !updatedText || updatedText.trim().length === 0) {
        req.flash('error', 'Review cannot be empty.')
    }
    try {
        await updateReview(reviewId, updatedText);
        req.flash('success', 'Review updated successfully!')
        res.redirect('/reviews');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Error updating review.');
        res.redirect(`/reviews/edit/${reviewId}`);
    }
});
router.post('/delete/:reviewId', async (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'You must be logged in to delete a review.')
        return res.redirect('/reviews');
    }
    const reviewId = req.params.reviewId;
    const userRole = req.session.user?.role_name;
    try {
        await deleteReview(reviewId);
        req.flash('success', 'Review deleted successfully!');
        if (userRole === "user") {
            res.redirect('/reviews');
        } else {
            res.redirect('/reviews/manage');
        }
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to delete review.');
        return res.redirect('/reviews');
    }
})
router.get('/manage', async (req, res) => {
    if (!req.session.isLoggedIn || req.session.user.role_name == "user") {
        req.flash('error', 'Access denied.');
        return res.redirect('/')
    };
    try {
        const reviews = await getAllReviews();
        const title = 'Manage Reviews';
        res.render('reviews/manage', { title, reviews})
    } catch (error) {
        console.log(error);
        req.flash('error', 'Could not load reviews.');
        res.redirect('/');
    }
})

router.get('/:category/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'You must be logged in to submit a review.')
        return res.redirect('/');
    };
    const { id, category } = req.params;
    const vehicle = await getVehicleById(id);
    const title = `Review ${vehicle.name}`;

    if (!vehicle) {
        req.flash('error', 'Vehicle not found.')
        return res.redirect('/');
    }

    res.render('reviews/review', { title, vehicle, category });
})
router.post('/:category/:id', async (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'You must be logged in to submit a review.')
        return res.redirect('/');
    };

    const { id, category } = req.params;
    const vehicle = await getVehicleById(id);
    const vehicle_id = vehicle.id;
    const reviewText = req.body.review;
    const userId = req.session.user.id;

    
    if (!reviewText || reviewText.trim().length === 0) {
        req.flash('error', 'Review cannot be empty.')
        return res.redirect(`/category/${category}/${id}`);
    }

    try {
        await addReview({ userId, vehicleId: vehicle_id, reviewText: reviewText.trim() });
        req.flash('success', 'Review Submitted!')
        res.redirect(`/category/${category}/${id}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error submitting review.')
        res.redirect(`/category/${category}/${id}`);
    }
})

export default router;