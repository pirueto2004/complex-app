const apiRouter = require('express').Router()
//Require the userController file
const userController = require('./controllers/userController')
//Require the postController file
const postController = require('./controllers/postController')
//Require the followController file
const followController = require('./controllers/followController')
//Require CORS package
const cors = require('cors')

//Apply cors to all the API Routes to be accessible from any domain
apiRouter.use(cors())

apiRouter.post('/login', userController.apiLogin)
apiRouter.post('/create-post', userController.apiMustBeLoggedIn, postController.apiCreate)
apiRouter.delete('/post/:id', userController.apiMustBeLoggedIn, postController.apiDelete)
apiRouter.get('/postsByAuthor/:username', userController.apiGetPostsByUsername)

module.exports = apiRouter