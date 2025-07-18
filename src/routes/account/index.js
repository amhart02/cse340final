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
    const { username: email, password } = req.body;

    if (!email || !password) {
            req.flash('error', 'Please enter both email and password.')
            return res.redirect('account/login');
        };
    try {
        const user = await authenticateUser(email, password);
        if(!user) {
            req.flash('error', 'Invalid email or password.')
            return res.redirect('account/login');
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.loginTime = new Date();
        res.redirect('/account/dashboard');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong. Please try again')
        res.render('account/login', { title });
    }
});

//logout route
router.post('/logout', (req, res) => { 
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Access Denied');
        return res.redirect("/");
    }
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Logout failed.')
            return res.redirect('/account/dashboard');
        }
        res.clearCookie('sessionId');
        res.redirect('/');
    });
});

//dashboard route
router.get('/dashboard', (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Access Denied');
        return res.redirect("/login");
    }
    const title = 'Account Dashboard';
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
    const errors = [];

    if (!email || !email.includes('@')) errors.push('Valid email is required.');
    if (!password || password.length < 8) errors.push('Password must be at least 8 characters.');
    if (password !== confirmPassword) errors.push('Passwords do not match.');

    if (errors.length > 0) {
        errors.forEach(error => req.flash('error', error));
        return res.redirect('/account/register');
    }

    try {
        await createUser({ email, password });
        req.flash('success', 'Account created successfully. You can now log in.');
        res.redirect('/account/login');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Failed to create account.');
        res.redirect('/account/register');
    }
});

//update account routes
router.get('/update/:type', (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Access Denied');
        return res.redirect("/login");
    }
    if (!allowed.includes(type)) {
        req.flash('error', 'Invalid update type.');
        return res.redirect('/account/dashboard');
    }
    const title = `Update ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const type = req.params.type;
    res.render('account/update', {title, update: type });
});
router.post('/update/:type', async (req, res) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Access Denied');
        return res.redirect("/login");
    }
    const title = 'Update Account';
    const { type } = req.params;
    const userId = req.session.user.id;
    const errors = [];
    try {
        if (type === 'email') {
            const { newEmail, confirmEmail } = req.body;
            if (!newEmail || !newEmail.includes('@')) errors.push('Valid new email required.');
            if (newEmail !== confirmEmail) errors.push('Emails do not match.');
            if (errors.length === 0) {
                await updateEmail(userId, newEmail);
                req.flash('success', 'Email updated successfully.');
            }
        } else if (type === 'password') {
            if (!newPassword || newPassword.length < 8) errors.push('Password must be at least 8 characters.');
            if (newPassword !== confirmPassword) errors.push('Passwords do not match.');

            if (errors.length === 0) {
                await updatePassword(userId, newPassword);
                req.flash('success', 'Password updated successfully.');
            }
        } else {
            errors.push('Invalid update type.');
        }
        if (errors.length > 0) {
            errors.forEach(error => req.flash('error', error));
            return res.redirect(`/account/update/${type}`);
        }
        res.redirect('/account/dashboard');
    } catch (error) {
        console.error('Update error:', err);
        req.flash('error', 'Failed to update account.');
        res.redirect(`/account/update/${type}`);
    }
})

export default router;