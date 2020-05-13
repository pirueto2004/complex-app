const Post = require('../models/Post')
const viewCreateScreen = (req, res) => {
    // res.render('create-post', {username: req.session.user.username, avatar: req.session.user.avatar}) **no longer need to export session date from here
    res.render('create-post')
 }

 const create = (req, res) => {
    let post = new Post(req.body, req.session.user._id)
    //create returns a promise
    post.create().then( () => {
        res.send('New post created!')
    }).catch( (errors) => {
        res.send(errors)
    })
 }

 const viewPost = async (req, res) => {
    try {
        let post = await Post.findPostById(req.params.id)
        res.render('single-post-screen', {post: post})
    } catch {
        res.render('404')
    }
 }

 module.exports = {viewCreateScreen, create, viewPost}