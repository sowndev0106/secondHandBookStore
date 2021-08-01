const User = require('..//models/User')
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('..//..//config/passport/passport-config')

class LoginController {
    // [GET] /Login 
    loginPage(req, res, next) {
        res.render('account/login')
    }
    // [POST] /Login 
    login(req, res, next) {


        if (req.user) {
            res.json({
                status: true
            })
        } else {
            res.json({
                status: false
                , error: "Tài khoảng hoặc mật khẩu không đúng"
            })
            return
        }

        // passport.authenticate('local', function (err, user, done) {
        //     if (err) {
        //         res.json({
        //             status: false
        //             , error: "ERROR"
        //         })
        //         return done(null, false, { massage: "No user with that email" })
        //     }
        //     // User does not exist
        //     if (!user) {
        //         res.json({
        //             status: false
        //             , error: "Email hoặc mật khẩu không đúng"
        //         })
        //         return done(null, false, { massage: "No user with that email" })
        //     }
        //     res.cookie('userID', user._id)
        //     res.cookie('lastName', user.lastName)
        //     res.json({
        //         status: true
        //     })

        // })(req, res, next);

        // if (!req.body.email || !req.body.password) {
        //     res.json({
        //         status: false,
        //         error: 'Bạn chưa điền đầy đủ thông tin'
        //     })
        //     return
        // }
        // try {

        //     // User.findOne({ email: req.body.email, password: hasherPassword })
        //     //     .then(function (user) {
        //     //         if (user) {
        //     //             res.cookie('userID', user._id)
        //     //             res.cookie('lastName', user.lastName)
        //     //             res.json({ status: true })
        //     //             // res.status(200).send()
        //     //         } else {
        //     //             // res.status(500).send()
        //     //             res.json({
        //     //                 status: false,
        //     //                 error: 'Tài khoảng mật khẩu không đúng'
        //     //             })
        //     //         }
        //     //     })
        // } catch (error) {
        //     res.status(500).send()
        // }

    }
    // [POST] /register
    showResgister(req, res, next) {
        res.render('account/register')
    }
    // [POST] /signin 
    resgister(req, res, next) {
        if (!req.body.email || !req.body.password || !req.body.lastName || !req.body.firstName) {
            res.json({
                status: false,
                error: 'Bạn phải điển đầy đủ thông tin'
            })
            return
        }
        var user = new User(req.body)
        var regexName = /[^0-9!@@#$%^&*\(\)\+\-\.{}\]\[\|\\":';<>,`~?]+$/
        if (!user.lastName || !regexName.test(user.lastName)) {
            res.json({
                status: false,
                error: "Họ không được rỗng, không chứa số kí tự đặc biệt"
            })
        }
        if (!user.firstName || !regexName.test(user.firstName)) {
            res.json({
                status: false,
                error: "Tên không được rỗng, không chứa số kí tự đặc biệt"
            })
        }
        if (!user.email) {
            res.json({
                status: false,
                error: "Email không được rỗng"
            })
        }
        if (!/^[a-zA-Z][a-zA-Z0-9]*@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/.test(user.email)) {
            res.json({
                status: false,
                error: "Email không không đúng địng dạng (VD:someone@host.hostname)"
            })
        }
        if (!user.password || user.password.length < 6) {
            res.json({
                status: false,
                error: "Mật khẩu không được rỗng và lớn hơn 6 kí tự"
            })
        }
        try {

            User.findOne({ email: req.body.email })
                .then(async function (result) {
                    if (result == null) {
                        const salt = await bcrypt.genSalt()
                        const hasherPassword = await bcrypt.hash(user.password, salt)
                        user.password = hasherPassword
                        user.save()
                            .then(function () {
                                res.cookie('userID', user._id)
                                res.cookie('lastName', user.lastName)
                                res.json({
                                    status: true
                                })
                            })
                            .catch(function (err) {
                                res.json({
                                    status: false,
                                    error: "Đăng kí thất bại"
                                })
                            })
                    } else {
                        res.json({
                            status: false,
                            error: "Email đã tồn tại"
                        })
                    }
                })
        } catch (error) {
            res.status(500).send()
        }
    }
    //[POST}] /account/logout
    logout(req, res, next) {
        req.logout();
        res.redirect('/')
    }
    // [GET] /account/fakebook/callback
    fakebook(req, res, next) {
        return res.redirect('/');
    }
    // [GET] /account/google/callback
    google(req, res, next) {
        res.redirect('back')
    }
}
module.exports = new LoginController