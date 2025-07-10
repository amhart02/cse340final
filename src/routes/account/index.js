import express from 'express';
import { createUser, authenticateUser, emailExists } from '../../models/account/index.js';

const router = express.Router();

router.get('/login', (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/account/dashboard');
    }

    res.render('login', {title: 'Login'});
});

router.post('/login', async (req, res) => {
    try {
        const { username: email, password } = req.body;

        if (!email || !password) {
            return res.render('login', { title: 'Login'});
        };

        const user = await authenticateUser(email, password);

        if(!user) {
            return res.render('login', { title: 'Login'});
        }

        req.session.isLoggedIn = true;
        req.session.user = user;
        req.loginTime = new Date();

        res.redirect('/account/dashboard');
    } catch (error) {
        res.render('login', {title: 'Login'});
    }
});

router.get('/dashboard', (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('login');
    }

    res.render('dashboard', { title: 'Account Dashboard', user: req.session.user, loginTime: req.session.loginTime});
});

router.post('/logout', (req, res) => { 
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/account/dashboard');
        }

        res.clearCookie('sessionId');
        res.redirect('/');
    });
});

router.get('/register', (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/account/dashboard');
    }

    res.render('register', { title: 'Create Account' });
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const errors = [];

        if (!email || !email.includes('@')) {
            errors.push('Valid email address is required');
        }

        if (!password || password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }

        if (email && await emailExists(email)) {
            errors.push('An account with this email already exists');
        }

        // if (errors.length > 0) {
        //     errors.forEach(error => req.flash('error', error));
        //     return res.render('register', {
        //         title: 'Create Account'
        //     });
        // }

        await createUser({ email, password });

        res.redirect('/account/login');

    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { title: 'Create Account'});
    }
});

export default router;