const express = require('express')

//Creating Router() object
const router = express.Router()

//Require the userController file
const userController = require('./controllers/userController')

//Require the postController file
const postController = require('./controllers/postController')


//user related Routes
router.get('/', userController.home)

router.post('/register', userController.register)

router.post('/login', userController.login)

router.post('/logout', userController.logout)

//post related Routes
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)



module.exports = router