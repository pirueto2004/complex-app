const User = require('../models/User')
//ES6 syntax

const login = (req, res) => { 
    let user = new User(req.body)
    //Making a Promise
    user.login().then( (result) => {
        req.session.user = {username: user.data.username, favColor: "blue"}
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
        req.session.user = {username: user.data.username}
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
        res.render('home-dashboard', {username: req.session.user.username})
    } else {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }
}

module.exports = { login, logout, register, home }

