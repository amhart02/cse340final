// work on figuring out POST and getting it to the database
router.post('/contactSuccess', (req, res) => {
    const title = "Contact Successful";
    res.render('contactSuccess', { title })
})