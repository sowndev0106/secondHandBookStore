// neu da dang nhap roi thi chuyen lai trang / neu chua moi cho vao trang login
module.exports.checklogged = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/account/login');

}
module.exports.checkNoLogged = function (req, res, next) {
    if (!req.isAuthenticated())
        return next();
    res.redirect('/');

}
// show user name da login
module.exports.addUserLocal = function (req, res, next) {
    try {
        if (req.user) {
            res.locals.userID = req.user._id
            res.locals.lastName = req.user.lastName
            if (req.user.avatar) {
                res.locals.avatar = req.user.avatar
            } else {
                res.locals.avatar = '/images/user5.png'
            }

        }
    } catch (err) {
        console.log('ERROR accountMiddlewares addUserLocal ' + err.message)
    }
    next()
}