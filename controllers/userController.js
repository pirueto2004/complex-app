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

 const home = async (req, res) => { 
     //If there is a session associated to the browser data
    if (req.session.user) {
        // res.render('home-dashboard', {username: req.session.user.username, avatar: req.session.user.avatar}) **no longer need to export session data from here
        //Fetch feed of posts of current user
        let posts = await Post.getFeed(req.session.user._id)
        res.render('home-dashboard', {posts: posts})
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
            title: `Profile for ${req.profileUser.username}`,
            currentPage: "posts",
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
                postCount: req.postCount,
                followerCount: req.followerCount,
                followingCount: req.followingCount
            }
        })
    }).catch( () => {
        res.render('404')
    })
}

const sharedProfileData = async (req, res, next) => {
    let isVisitorsProfile = false
    let isFollowing = false
    if (req.session.user) {
        isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
    }
    req.isVisitorsProfile = isVisitorsProfile
    req.isFollowing = isFollowing

    //Retrieve posts, follower, and following counts

    // let postCount = await Post.countPostsByAuthor()
    // let followerCount = await Follow.countFollowersById()
    // let followingCount = await Follow.countFollowingById()

    let postCountPromise =  Post.countPostsByAuthor(req.profileUser._id)
    let followerCountPromise =  Follow.countFollowersById(req.profileUser._id)
    let followingCountPromise =  Follow.countFollowingById(req.profileUser._id)

    //We wait for all of the promises to complete before we move on
    // let results = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise])

    //Best approach is the array distructuring
    let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise])

    req.postCount = postCount
    req.followerCount = followerCount
    req.followingCount = followingCount

    next()

}

const profileFollowersScreen = async (req, res) => {
    try {
        let followers = await Follow.getFollowersById(req.profileUser._id)
        res.render('profile-followers', {
            currentPage: "followers",
            followers: followers,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            followerCount: req.followerCount,
            counts: {
                postCount: req.postCount,
                followerCount: req.followerCount,
                followingCount: req.followingCount
            }
        })
    } catch {
        res.render('404')
    }
}

const profileFollowingScreen = async (req, res) => {
    try {
        let following = await Follow.getFollowingById(req.profileUser._id)
        res.render('profile-following', {
            currentPage: "following",
            following: following,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
                postCount: req.postCount,
                followerCount: req.followerCount,
                followingCount: req.followingCount
            }
        })
    } catch {
        res.render('404')
    }
}

const doesUsernameExist = (req, res) => {
    User.findByUsername(req.body.username).then( () => {
        res.json(true)
    }).catch( () => {
        res.json(false)
    })
}

const doesEmailExist = async (req, res) => {
    let emailExists = await User.doesEmailExist(req.body.email)
    res.json(emailExists)
}


module.exports = { login, logout, register, home, mustBeLoggedIn, ifUserExists, profilePostsScreen, sharedProfileData, profileFollowersScreen, profileFollowingScreen, doesUsernameExist, doesEmailExist }

