//Require the express module
const express = require('express')

//Require the session module
const session = require('express-session')

//Require package for saving sessions in MongoDB database
const MongoStore = require('connect-mongo')(session)

//Require package for flash messages
const flash = require('connect-flash')

//Create our express server
const app = express()

//Configure session
let sessionOptions = session({
    secret: "JavaScript is soooooo coooool",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false, 
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

//Enable sessions
app.use(sessionOptions)

//Enable flash messages
app.use(flash())

//Require the router file
const router = require('./router')

//Always add the following boilerplate code to your app for enabling the user request to be accessible from the req.body object
app.use(express.urlencoded({extended: false}))

//Always add the following boilerplate code to your app for enabling the asyncronous requests to be accessible from the req.body object
app.use(express.json())

//Tell express to make the public folder accessible
app.use(express.static('public'))

//Configure our template engine
app.set('views', 'views')
app.set('view engine', 'ejs')

//Tell our app to use the router for receiving GET requests to the base url (home page)
app.use('/', router)

module.exports = app