const User = require('../models/User')
const Post = require('../models/Post')
const Follow = require('../models/Follow')

//ES6 syntax

const mustBeLoggedIn = (req, res, next) => {
    //There is a session with a user looged in
    if (req.session.user) {
        next()
    } else {
        req.flash('errors', 'You must be logged in to perform that action.')
        //Save our session data before redirecting
        req.session.save( () => {
            res.redirect('/')
        })
    }
}

const login = (req, res) => { 
    let user = new User(req.body)
    //Making a Promise
    user.login().then( () => {
        req.session.user = {username: user.data.username, avatar: user.avatar, _id: user.data._id}
        req.session.save( () => {
            res.redirect('/')
        })
    }).catch( (err) => {
        //Error is attached to the request object to make it persistent and save it into the errors array
        req.flash('errors', err)
        //req.session.flash.errors = [err]
        req.session.save( () => {
            res.redirect('/')
        })
    })
}

const logout = (req, res) => {
    req.session.destroy( () => {
        res.redirect('/')
    })
 }

//The register function returns a promise
const register = (req, res) => {
    let user = new User(req.body)
    user.register().then( () => {
        req.session.user = {username: user.data.username, avatar: user.avatar, _id: user.data._id}
        req.session.save( () => {
            res.redirect('/')
        })
    }).catch( (regErrors) => {
        regErrors.forEach( error => {
            req.flash('regErrors', error)
        })
        req.session.save( () => {
            res.redirect('/')
        })
    })
}

 const home = (req, res) => { 
     //If there is a session associated to the browser data
    if (req.session.user) {
        // res.render('home-dashboard', {username: req.session.user.username, avatar: req.session.user.avatar}) **no longer need to export session date from here
        res.render('home-dashboard')
    } else {
        res.render('home-guest', {regErrors: req.flash('regErrors')})
    }
}

const ifUserExists = (req, res, next) => {
    User.findByUsername(req.params.username).then( (userDocument) => {
        req.profileUser = userDocument
        next()
    }).catch( () => {
        res.render('404')
    })
}

const profilePostsScreen = (req, res) => {
    //Ask our post model for posts by a certain author id
    Post.findByAuthorId(req.profileUser._id).then( (posts) => {
        res.render('profile', {
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing
        })
    }).catch( () => {
        res.render('404')
    })
}

const sharedProfileData = async (req, res, next) => {
    let isFollowing = false
    if (req.session.user) {
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
    }

    req.isFollowing = isFollowing
    next()
}


module.exports = { login, logout, register, home, mustBeLoggedIn, ifUserExists, profilePostsScreen, sharedProfileData }

