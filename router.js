const express = require('express')

//Creating Router() object
const router = express.Router()

//Require the userController file
const userController = require('./controllers/userController')

//Require the postController file
const postController = require('./controllers/postController')

//Require the followController file
const followController = require('./controllers/followController')


//user related Routes
router.get('/', userController.home)

router.post('/register', userController.register)

router.post('/login', userController.login)

router.post('/logout', userController.logout)

//post related Routes
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewPost)
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.editPost)
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.deletePost)
router.post('/search', postController.search)

//profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)

//follow related routes
router.post('/addFollow/:username', userController.mustBeLoggedIn, followController.addFollow)

module.exports = router