const express = require('express')
const router =  express.Router();
router.get('/',(req,res)=>
{
    res.render('index')
})
router.get('/about',(req,res)=>
{
    res.render('aboutpage')
})
router.get('/contact',(req,res)=>
{
    res.render('contact')
})
router.get('/price',(req,res)=>
{
    res.render('price')
})
router.get('/faq',(req,res)=>
{
    res.render('faq')
})
router.get('/courses',(req,res)=>
{
    res.render('gallery')
})
router.get('/pay',(req,res)=>
{
    res.render('payment')
})

module.exports = router;