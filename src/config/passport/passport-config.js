const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Post = require('..//..//app/models/Post')
const PassportFB = require('passport-facebook').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var configAuth = require('./configAuth')
const User = require('..//..//app/models/User')
var passport = require('passport')

// google
passport.use(new GoogleStrategy({
    clientID: configAuth.google.clientID,
    clientSecret: configAuth.google.clientSecret,
    callbackURL: configAuth.google.callbackURL
},
    function (accessToken, refreshToken, profile, done) {
        var info = profile._json
        User.findOne({ googleID: info.sub })
            .then((user) => {
                if (user != null) {
                    return done(null, user)
                } else {
                    // neu k co thi tao moi]
                    var newUser = new User({
                        lastName: info.given_name.toUpperCase(),
                        avatar: info.picture,
                        firstName: info.family_name.toUpperCase(),
                        provider: profile.provider,
                        googleID: info.sub,
                        email: info.email
                    })
                    newUser.save()
                        .then(() => {
                            console.log(newUser)
                            return done(null, newUser)
                        })
                        .catch((err) => {
                            return done(null)
                        })
                }
            })
            .catch((err) => {
                return done(null)
            })
    }
));


// fakebook
passport.use(new PassportFB(
    {
        clientID: configAuth.fakebook.clientID,
        clientSecret: configAuth.fakebook.clientSecret,
        callbackURL: configAuth.fakebook.callbackURL,
        profileFields: ['email', 'last_name', 'first_name', 'timezone']
    },
    // cai nay chua ket qua tra ve
    (accessToken, refreshToken, profile, done) => {
        // tim hoac them User moi vao database
        var info = profile._json
        User.findOne({ fakebookID: info.id })
            .then((user) => {
                if (user != null) {
                    return done(null, user)
                } else {
                    // neu k co thi tao moi]
                    var newUser = new User({
                        fakebookID: info.id,
                        email: info.email,
                        provider: profile.provider,
                        lastName: info.last_name.toUpperCase(),
                        firstName: info.first_name.toUpperCase()
                    })
                    newUser.save()
                        .then(() => {
                            return done(null, newUser)
                        })
                        .catch((err) => {
                            return done(null)
                        })
                }
            })
            .catch((err) => {
                return done(null)
            })
    }
))
// local
passport.use(new localStrategy(function (username, password, done) {
    console.log(username + password)
    User.findOne({ email: username, password: password })
        .then((user) => {
            if (user) {
                return done(null, user, { massage: "Login correct" })
            } else {
                return done(null, false, { massage: "Login incorrect" })
            }
        })
        .catch((err) => {
            return done(null, false, { massage: "ERROR " })
        })
}))

// all

passport.serializeUser((user, done) => {
    done(null, user._id) // luu vao cookie
})
passport.deserializeUser(function (id, done) {
    User.findOne({ _id: id }, function (err, user) {
        done(err, user);
    })
})
