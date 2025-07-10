router.get('/contact', (req, res) => {
    const title = "Contact";
    res.render('contact', { title })
})

