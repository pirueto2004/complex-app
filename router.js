const express = require('express')

//Creating Router() object
const router = express.Router()

//Require the userController file
const userController = require('./controllers/userController')

//Require the postController file
const postController = require('./controllers/postController')


//User related Routes
router.get('/', userController.home)

router.post('/register', userController.register)

router.post('/login', userController.login)

router.post('/logout', userController.logout)

//Post related Routes
router.get('/create-post', postController.viewCreateScreen)




module.exports = router