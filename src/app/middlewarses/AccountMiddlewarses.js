const User = require('../models/User')
module.exports.requireLogin = function (req, res, next) {
    try {
        if (!req.cookies.userId) {
            res.redirect('back')
            return
        }
        User.findOne({ _id: req.cookies.userId })
            .then(function (user) {
                if (!user) {
                    res.redirect('back')
                    return;
                }
            })
            .catch(function () {
                throw new Error
            })
    } catch (err) {
        res.redirect('back')
        return;
    }
    next()
}
// neu da dang nhap roi thi chuyen lai trang / neu chua moi cho vao trang login
module.exports.checklogged = function (req, res, next) {
    try {
        if (!req.cookies.userId) {
            next()
        } else {
            res.redirect('/')
        }
    } catch (err) {
        next()
    }
}
// show user name da login
module.exports.addUserLocal = function (req, res, next) {

    try {
        if (req.cookies.userID && req.cookies.lastName) {
                res.locals.userID = req.cookies.userID
                res.locals.lastName = req.cookies.lastName
            // User.findOne({ _id: req.cookies.userID })
            // .then(function (user) {
            //     if (user) {
            //         res.locals.userID = req.cookies.userID
            //         res.locals.lastName = req.cookies.lastName
                   
            //     } else {
            //         req.cookies.userID = undefined
            //         req.cookies.lastName = undefined
            //     }
            // })
        }
    } catch (err) {
        console.log('ERROR accountMiddlewares addUserLocal ' + err.message)
    }
    next()
}