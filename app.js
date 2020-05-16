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

//Tell Express to run this function for every request
app.use( function(req, res, next) {

    //Make all error and success flash messages available from all templates
    res.locals.errors = req.flash('errors')
    res.locals.success = req.flash('success')

    //Make current user id available on the request object
    if (req.session.user) {
        req.visitorId = req.session.user._id
    } else {
        req.visitorId = 0
    }
    //Here we include our user data to make them available from within every local template
    res.locals.user = req.session.user
    next()
})

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