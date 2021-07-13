const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Post = require('..//..//app/models/Post')

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        Post.findOne({ email: email })
            .then(async function (user) {
                if (user == null) {
                    return done(null, false, { message: 'No User with that email' })
                }
                try {
                    if (await bcrypt.compare(passport, user.password)) {
                        return done(null, false)
                    } else {
                        return done(null, false, { message: 'Password incorrect' })
                    }
                } catch (error) {
                    return done(e)
                }
            })
            .catch(function (err) {
                return done(null, false, { message: err })

            })

    }
    passport.use(new localStrategy({ email: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => {

    })
    passport.deserializeUser((id, done) => {

    })
}

module.exports = initialize