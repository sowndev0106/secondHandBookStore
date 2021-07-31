const express = require('express')
const { Passport } = require('passport')
const router = express.Router()
const passport = require('passport')
const loginController = require('../app/controller/LoginController')
const accountMiddlewares = require('..//app/middlewarses/AccountMiddlewarses')


router.get('/login', accountMiddlewares.checkNoLogged, loginController.loginPage);
router.get('/signup', accountMiddlewares.checkNoLogged, loginController.showResgister);
router.post('/login', passport.authenticate('local'), loginController.login);
router.get('/fakebook', passport.authenticate('facebook', { scope: ['email'] }))
router.use('/fakebook/callback', passport.authenticate('facebook', { failureRedirect: '/account/login', successRedirect: '/' }))
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/account/login', successRedirect: 'back' }), loginController.google)
router.post('/logout', loginController.logout)
router.post('/resgister', loginController.resgister)

//  xu ly login
module.exports = router