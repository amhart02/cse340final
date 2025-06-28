import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    const title = "Home";
    res.render('index', { title })
})

router.get('/contact', (req, res) => {
    const title = "Contact";
    res.render('contact', { title })
})

// work on figuring out POST and getting it to the database
router.post('/contactSuccess', (req, res) => {
    const title = "Contact Successful";
    res.render('contactSuccess', { title })
})

router.get('/categories', (req, res) => {
    const title = "Vehicle Categories";
    res.render('categories', { title })
})

// fix this
router.get('/category', (req, res) => {
    const title = "Truck";
    res.render('category', { title })
})

//fix this too
router.get('/vehicleDetail', (req, res) => {
    const title = "Truck 1";
    res.render('vehicleDetail', { title })
})

router.get('/register', (req, res) => {
    const title = "register";
    res.render('register', { title })
})

router.get('/login', (req, res) => {
    const title = "login";
    res.render('login', { title })
})

export default router;