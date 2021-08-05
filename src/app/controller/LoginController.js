const User = require('..//models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const initializePassport = require('..//..//config/passport/passport-config')
const nodemailer_config = require('..//..//config/mail/nodemailer')

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
    // // [POST] /register
    // showResgister(req, res, next) {
    //     res.render('account/register')
    // }
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
            User.findOne({ email: req.body.email, provider: 'local' })
                .then(async function (result) {
                    if (result) {
                        res.json({
                            status: false,
                            error: "Email đã tồn tại"
                        })
                        return
                    }
                    const salt = await bcrypt.genSalt(parseInt(process.env.SALROUNDSNUMBER))
                    const hasherPassword = await bcrypt.hash(user.password, salt)
                    user.password = hasherPassword
                    user.provider = 'local'
                    const token = jwt.sign({ user }, process.env.JWT_ACC_ACTIVE, { expiresIn: '30m' })
                    var message = `<h3>Chào ${req.body.firstName} ${req.body.lastName}</h3> <span> Cảm ơn bạn đã đăng nhập vào
                    <a href='https://${req.headers.host}' >https://${req.headers.host}</a> </span> <br>
                        <span> Nếu đây là bạn vui lòng <a href='https://${req.headers.host}/account/verifyemail/${token}'> nhấn vào đây để xác thực tài khoảng</a></span> <br>
                            <small>*** Đường dẫn chỉ có hiệu lực trong 30 phút <small>
                                `
                    nodemailer_config.sendEmail(req.body.email, 'Xác thực tài khoảng SecondhandbooksOnline', message)

                    res.json({
                        status: true
                    })
                })
        } catch (error) {
            res.status(500).send()
        }
    }
    //[GET] /account/verifyemail/:token
    verifyEmail(req, res, next) {
        const { token } = req.params
        if (!token) {
            res.redirect('/')
        }
        jwt.verify(token, process.env.JWT_ACC_ACTIVE, function (err, data) {
            if (err || !data || !data.user) {
                res.render('account/notiication', {
                    title: 'Xác thực lỗi do quá hạn hoặc địa chỉ xác thực không đúng',
                    hrefRedirect: '/',
                    messageRedirect: 'Nhấn vào đây để quay lại trang chính',
                    statusText: 'text-danger'
                })
                return
            }
            const { user } = data
            user.lastName = user.lastName.toLowerCase()
            user.firstName = user.firstName.toLowerCase()
            new User(user).save()
            res.render('account/notiication', {
                title: 'Xác thực tài khoảng thành công',
                hrefRedirect: '/',
                messageRedirect: 'Nhấn vào đây để quay lại trang chính',
                statusText: 'text-success'
            })
        })
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
    // [GET]/api/account/seach
    searchUser(req, res, next) {
        if (req.query.q) {
            // convertText(req.query.q) : Chuyển thành chữ không dấu và viết thường
            // var search = new RegExp(convertText.englishAlphabetLowercased((req.query.q)))
            var search = new RegExp(req.query.q.toLowerCase())
            User.find({ $or: [{ 'lastName': search }, { 'firstName': search }] }).limit(8)
                .then(function (users) {
                    res.json(users)
                })
                .catch(function (err) {
                    res.status(500)
                })
        } else {
            res.status(404)
        }
    }
}
module.exports = new LoginController