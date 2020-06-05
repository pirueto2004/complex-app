//Require the express module
const   express = require('express'),
//Require the session module
        session = require('express-session'),
//Require package for saving sessions in MongoDB database
        MongoStore = require('connect-mongo')(session),
//Require package for flash messages
        flash = require('connect-flash'),
//Require the markdown package
        markdown = require('marked'),
//Require the sanitize-html package
        sanitizeHTML = require('sanitize-html')

const Buffer = require('buffer/').Buffer

module.exports = Buffer

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

    //Make markdown function available from within ejs templates
    res.locals.filterUserHTML = content => {
        return sanitizeHTML(markdown(content), {
            allowedTags: ['a', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'em', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            allowedAttributes: {}
        })
    }

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

//Create a server for our app
const server = require('http').createServer(app)

// // // //Require the socket connection  
const io = require('socket.io')(server)

io.use( (socket, next) => {
    sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', socket => {
    if (socket.request.session.user) {
        let user = socket.request.session.user

        socket.emit('welcome', {username: user.username, avatar: user.avatar})

        socket.on('chatMessageFromBrowser', data => {
            // console.log(data.message)
            //Broadcast the message to all other connected clients, including the client that sent it.
            // io.emit('chatMessageFromServer', {message: data.message, username: user.username, avatar: user.avatar})

            //Broadcast the message to all other connected clients, NOT including the client that sent it.
            socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar})
        })
    }
})

// module.exports = app

module.exports = server