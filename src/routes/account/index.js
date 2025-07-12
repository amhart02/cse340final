import express from 'express';

import { createUser, authenticateUser, emailExists, updateEmail, updatePassword } from '../../models/account/index.js';

const router = express.Router();

// login routes 
router.get('/login', (req, res) => {
    const title = 'Login';
    if (req.session.isLoggedIn) {
        return res.redirect('/account/dashboard');
    }
    res.render('account/login', { title, user: req.session.user || null, req });
});
router.post('/login', async (req, res) => {
    const title = 'Login';
    try {
        const { username: email, password } = req.body;
        if (!email || !password) {
            return res.render('account/login', { title: 'Login'});
        };
        const user = await authenticateUser(email, password);
        if(!user) {
            return res.render('account/login', { title: 'Login'});
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.loginTime = new Date();
        res.redirect('/account/dashboard');
    } catch (error) {
        res.render('account/login', { title });
    }
});

//logout route
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

//dashboard route
router.get('/dashboard', (req, res) => {
    const title = 'Account Dashboard';
    if (!req.session.isLoggedIn) {
        return res.redirect('login');
    }
    res.render('account/dashboard', { title , user: req.session.user, loginTime: req.session.loginTime });
});

//register routes
router.get('/register', (req, res) => {
    const title = 'Create Account';
    if (req.session.isLoggedIn) {
        return res.redirect('/account/dashboard');
    }
    res.render('account/register', { title });
});
router.post('/register', async (req, res) => {
    const title = 'Create Account';
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
        res.render('account/register', { title });
    }
});

//update account routes
router.get('/update/:type', (req, res) => {
    const title = `Update ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const type = req.params.type;
    res.render('account/update', {title, update: type });
});
router.post('/update/:type', async (req, res) => {
    const title = 'Update Account';
    const { type } = req.params;
    const userId = req.session.user.id;
    try {
        if (type === 'email') {
            const { newEmail, confirmEmail } = req.body;
            if (newEmail === confirmEmail) {
                await updateEmail(userId, newEmail);
            }
        } else if (type === 'password') {
            const { newPassword, confirmPassword } = req.body;
            if (newPassword === confirmPassword) {
                await updatePassword(userId, newPassword);
            }
        }
        res.redirect('/account/dashboard');
    } catch (err) {
        console.error(err);
        res.render('account/update', { title, update: type });
    }
})

export default router;