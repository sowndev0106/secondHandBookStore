
const express = require('express')
var morgan = require('morgan')
const path = require('path')
var exphbs = require('express-handlebars');
var router = require('./router')
require('dotenv').config()
const app = express()
const methodOverride = require('method-override')
const port = process.env.PORT || 3000
const handlebars = require('handlebars')
const db = require('./config/db')
var cookieParser = require('cookie-parser')
var accountMiddlewares = require('./app/middlewarses/AccountMiddlewarses')
var flash = require('express-flash')
var session = require('express-session')
var passport = require('passport')
var Chat = require('./app/models/Chat')
var Room = require('./app/models/Room')
var User = require('./app/models/User')

// custom login passport
require('..//src/config/passport/passport-config')
var socketConfig = require('./config/socket/socket')

// https
var https = require('https')
var fs = require('fs');
// const sslServer = https.createServer({
//   key: fs.readFileSync('./cert/key.pem'),
//   cert: fs.readFileSync('./cert/cert.pem'),
// }, app)

const sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });
app.use(sessionMiddleware);
//local 
// const io = require('socket.io')(sslServer);
//server
// var http = require('http')
// var server = https.createServer(app);
// var io = require('socket.io').listen(server);
var server = require('http').Server(app);
var io = require('socket.io')(server);

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
socketConfig(io)
// ket noi database
db.connect()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({
  extended: true
}))
app.use(cookieParser());
// phai cau hinh session truoc sau co moi cau hinh passport
// app.use(session({
//   secret: 'something',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: 1000 * 60 * 60 * 1  // 1 hours
//   }
// }));
// khoi tao passport

app.use(passport.initialize())
app.use(passport.session())

// login 
app.use(flash())

// over PUT DELETE GET POST
app.use(methodOverride('_method'))

// set static file
app.use(express.static(path.join(__dirname, 'public')))

// HTTP loger
app.use(morgan('tiny'))

// Handlebars
var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  extname: '.hbs',
  helpers: require('./helper/helperHandlebars')
});
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs');


// custom middlewarse 
app.use(accountMiddlewares.addUserLocal)


//  cau truc thu muc lai
app.set('views', path.join(__dirname, 'resources/views'));


// io.use((socket, next) => {
//   console.log(socket.request.session.passport)
//   if (socket.request.session.passport.user) {

//     next();
//   } else {
//     next(new Error('unauthorized'))
//   }
// });

router(app)

// sslServer.listen(port, () => console.log(`Secure server on https://localhost:${port}`))
server.listen(port, () => console.log("server start succeeded"))