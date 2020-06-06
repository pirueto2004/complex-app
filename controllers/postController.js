const Post = require('../models/Post')
const viewCreateScreen = (req, res) => {
    // res.render('create-post', {username: req.session.user.username, avatar: req.session.user.avatar}) **no longer need to export session date from here
    res.render('create-post')
 }

 const create = (req, res) => {
    let post = new Post(req.body, req.session.user._id)
    //create returns a promise
    post.create().then( (newId) => {
        req.flash('success', 'New post successfully created.')
        req.session.save( () => res.redirect(`/post/${newId}`))
    }).catch( (errors) => {
        errors.forEach( error => req.flash('errors', error))
        req.session.save( () => res.redirect('create-post'))
    })
 }

 const viewPost = async (req, res) => {
    try {
        let post = await Post.findPostById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post, title: post.title})
    } catch {
        res.render('404')
    }
 }

 const viewEditScreen = async (req, res) => {
    try {
        let post = await Post.findPostById(req.params.id, req.visitorId)
        if (post.isVisitorOwner) {
            res.render('edit-post', {post: post})
        } else {
            req.flash('errors', 'You do not have permission to perform that action.')
            req.session.save( () => res.redirect('/'))
        }
    } catch {
        res.render('404')
    }
 }

 const editPost = (req, res) => {
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then( (status) => {
        //The post was successfully updated in the database
        //or user did have permission, but there were validation errors
        if (status == 'success') {
            //Post was updated in db
            req.flash('success', 'Post successfully updated.')
            req.session.save( () => res.redirect(`/post/${req.params.id}/edit`))
        } else {
            post.errors.forEach( (error) => {
                req.flash('errors', error)
            })
            req.session.save( () => res.redirect(`/post/${req.params.id}/edit`))
        }
    }).catch( () => {
        //If a post with requested id doesn't exist
        //or if the current visitor is not the owner of the requested post
        req.flash('errors', 'You do not have permission to perform that action.')
        req.session.save( () => res.redirect('/'))
    })
 }

 const deletePost = (req, res) => {
    Post.delete(req.params.id, req.visitorId).then( () => {
        req.flash('success', 'Post successfully deleted.')
        req.session.save( () => res.redirect(`/profile/${req.session.user.username}`))
    }).catch( () => {
        req.flash('errors', 'You do not have permission to perfom that action.')
        req.session.save( () => res.redirect('/'))
    })
 }

 const search = (req, res) => {
    Post.search(req.body.searchTerm).then( posts => {
        res.json(posts)
    }).catch( () => {
        res.json([])
    })
 }

 module.exports = {viewCreateScreen, create, viewPost, viewEditScreen, editPost, deletePost, search}