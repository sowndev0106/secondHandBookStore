const sitesController = require('..//app/controller/SitesController')
const account = require('./account')
const post = require('./post')
const subject = require('./subject')
const department = require('./department')
const me = require('./me')
const store = require('./store')
const passport = require('passport')
const LoacalPassport = require('passport')

function router(app) {

    app.use('/post', post)
    app.use('/account', account)
    app.use('/me', me)
    app.use('/subject', subject)
    app.use('/department', department)
    app.use('/store', store)
    //  trang chu
    app.get('/', sitesController.index)
}
module.exports = router