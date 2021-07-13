const express = require('express')
const { Passport } = require('passport')
const router = express.Router()
const passport = require('passport')
const passportFB = require('passport-facebook').Strategy
const User = require('..//app/models/User')
// khoi tao controller
const loginController = require('../app/controller/LoginController')
const localStrategy = require('passport-local').Strategy

router.post('/login', loginController.login);
router.get('/fb', passport.authenticate('facebook', { scope: ['email'] }))
router.use('/fb/cb', passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        res.json({ status: true })
    })

router.post('/logout', loginController.logout)
router.post('/resgister', loginController.resgister)

// fakebook
passport.use(new passportFB(
    {
        clientID: "254008886189195",
        clientSecret: "3375f2d3d25f9f5f72852fe94b57c131",
        callbackURL: "https://localhost:3000/account/fb/cb",
        profileFields: ['email', 'displayName']
    },
    // cai nay chua ket qua tra ve
    (accessToken, refreshToken, profile, done) => {
        console.log(profile)
    }
))
// local
passport.use(new localStrategy(function (username, password, done) {

    User.findOne({ email: username, password: password })
        .then((user) => {
            if (user) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password not correct' })
            }
        })
        .catch((err) => {
            return done(null, false, { message: 'Error with ' })
        })
}))

// khi chung thuc thanh cong no se goi ham nay
passport.serializeUser((user, done) => {
    console.log(user)
    // ghi cookie
    done(null, user._id)
})
passport.deserializeUser(function (id, done) {
    console.log(id)
    User.findOrCreate(id, function (err, user) {
        done(err, user);
    })
})

module.exports = router