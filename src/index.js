if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
var morgan = require('morgan')
const path = require('path')
const exphbs = require('express-handlebars');
var router = require('./router')
const app = express()
const methodOverride = require('method-override')
const port = 3000
const handlebars = require('handlebars')
const db = require('./config/db')
var cookieParser = require('cookie-parser')
const accountMiddlewares = require('./app/middlewarses/AccountMiddlewarses')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')

// https
var https = require('https');
var fs = require('fs');

// ket noi database
db.connect()



//part thanh res.pody
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({
  extended: true
}))
// khoi tao passport
app.use(passport.initialize())
app.use(passport.session())

// login 
// app.use(flash())
app.use(session({
  secret: 'mySecrect'
  // resave: false,
  // saveUninitialized: false
}))

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
  helpers: {
    dropText: function (a, number1, number2) {
      if (a == undefined)
        return ''
      var length = a.split(' ').length
      if (a.length > number2) {
        a = a.slice(0, number2);
      } else {
        if (length > number1) {
          a = a.split(' ').splice(0, number1).join(' ');
          a += " ..."
        } else {
          if (a.length < (number2 / 2)) {
            a += '<br> <br>'
          }
        }


      }
      return a
    },
    selected: function (a, b) {
      return a == b ? 'selected' : ''
    },
    addOne: (a, b) => { return a + b },
    disabled: (a) => { return a ? '' : 'disabled' },
    softHelper: function (column, soft) {

      var softType = column === soft.column ? soft.type : 'default'
      var icons = {
        default: 'fad fa-sort',
        asc: 'fal fa-sort-amount-up-alt',
        desc: 'fal fa-sort-amount-down-alt'
      }
      var type = {
        default: 'desc',
        asc: 'desc',
        desc: 'asc'
      }
      var text
      if (column == 'createdAt') {
        text = 'Thời gian tạo'
      } else if ((column == 'price')) {
        text = 'Giá'
      } else {
        text = 'Tên'
      }
      const addresses = handlebars.escapeExpression(`?soft=${column}&type=${type[soft.type]}`)
      var output = `<a href=" ${addresses}" 
                class=" btn border " >  ${text}
                 <i class="${icons[softType]} text-primary"></i>
              </a>`
      return new handlebars.SafeString(output);
    },
    active: (a, b) => { return a == b ? 'active' : '' }
  }
});
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs');


// ADD COOKIE
app.use(cookieParser())


// custom middlewarse 
app.use(accountMiddlewares.addUserLocal)


//  cau truc thu muc lai
app.set('views', path.join(__dirname, 'resources/views'));

router(app)

// app.listen(port, () => {
// })

const sslServer = https.createServer({
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
}, app)
sslServer.listen(port, () => console.log(`Secure server on https://localhost:${port}`))