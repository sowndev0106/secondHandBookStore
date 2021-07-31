const sitesController = require('..//app/controller/SitesController')
const account = require('./account')
const post = require('./post')
const subject = require('./subject')
const department = require('./department')
const me = require('./me')
var store = require('./store')
var accountMiddlewares = require('..//app/middlewarses/AccountMiddlewarses')
var passport = require('passport')
var passportConig = require('..//config/passport/passport-config')
var api = require('./api')

function router(app) {
    app.use('/post', post)
    app.use('/chat', accountMiddlewares.checklogged, me)
    app.use('/account', account)
    app.use('/me', accountMiddlewares.checklogged, me)
    app.use('/subject', subject)
    app.use('/department', department)
    app.use('/store', store)
    app.use('/api', api)
    //  trang chu
    app.get('/', sitesController.index)
}
module.exports = router