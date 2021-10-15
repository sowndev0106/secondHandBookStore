const express = require('express')
const { Passport } = require('passport')
const router = express.Router()
const passport = require('passport')
const loginController = require('../app/controller/LoginController')
const accountMiddlewares = require('..//app/middlewarses/AccountMiddlewarses')
const { route } = require('./post')


router.get('/login', accountMiddlewares.checkNoLogged, loginController.loginPage);
router.post('/login', passport.authenticate('local'), loginController.login);
router.post('/resgister', loginController.resgister)
router.get('/verifyEmail/:token', loginController.verifyEmail);

router.get('/fakebook', passport.authenticate('facebook', { scope: ['email'] }))
router.use('/fakebook/callback', passport.authenticate('facebook', { failureRedirect: '/account/login', successRedirect: '/' }))

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/account/login', successRedirect: 'back' }), loginController.google)

router.post('/logout', loginController.logout)
    //  xu ly login
module.exports = router