const postsCollection = require('../db').db().collection('posts')
//Require ObjectID from mongodb
const ObjectID = require('mongodb').ObjectID
const User = require('./User')

let Post = function(data, userID, requestedPostId) {
    this.data = data
    this.errors = []
    this.userID = userID
    this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function() {
    if (typeof(this.data.title) !== 'string') { this.data.title = ""}
    if (typeof(this.data.body) !== 'string') { this.data.body = ""}

    //Get rid of any bogus properties that user may enter
    //so we overwrite the data property and trim any empty spaces at the beginning or end of the string and convert to lower cases
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date(),
        author: ObjectID(this.userID)
    }
}

Post.prototype.validate = function() {
    if (this.data.title == "") {this.errors.push("You must provide a title.")}
    if (this.data.body == "") {this.errors.push("You must provide post content.")}
}

Post.prototype.create = function() {
    return new Promise( (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            //save post into database
            postsCollection.insertOne(this.data).then( () => {
                resolve()
            }).catch( () => {
                //Errors here are related to problems with the MongoDB processing or database connection problems
                this.errors.push("Please try again later")
                reject(this.errors)
            })
           
        } else {
            reject(this.errors)
        }
    })
}

Post.prototype.update = function() {
    return new Promise( async (resolve, reject) => {
        try {
            let post = await Post.findPostById(this.requestedPostId, this.userID)
            //if visitor is the author of the post
            if (post.isVisitorOwner) {
                //actually update the db
                let status = await this.updateDB()
                resolve(status)
            //Otherwise
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}

Post.prototype.updateDB = function() {
    return new Promise( async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        //If there are no errors
        if (!this.errors.length) {
            await postsCollection.findOneAndUpdate({_id: new ObjectID(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}})
            resolve('success')
        } else {
            resolve('failure')
        }
    })
}

Post.resusablePostQuery = function(uniqueOperations, visitorId) {
    return new Promise( async (resolve, reject) => {
        
        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: 'authorDocument'}},
            {$project: {
                title: 1,
                body: 1,
                createdDate: 1,
                authorId: '$author',
                author: {$arrayElemAt: ['$authorDocument', 0]}
            }}
        ])
            let posts = await postsCollection.aggregate(aggOperations).toArray()

        // Cleanup author property in ach post object
        posts = posts.map( function(post) {
            //Check if the visitor id matches the author id of current post
            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })

        resolve(posts)
    })
}

Post.findPostById = function(id, visitorId) {
    return new Promise( async (resolve, reject) => {
        if (typeof(id) !== 'string' || !ObjectID.isValid(id)) {
            reject()
            return
        }
        
        let posts = await Post.resusablePostQuery([
            {$match: {_id: new ObjectID(id)}}
        ], visitorId)

        if (posts.length) {
            console.log(posts[0])
            resolve(posts[0])
        } else {
            reject()
        }
    })
}

Post.findByAuthorId = function(authorId) {
    return Post.resusablePostQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate: -1}}
    ])
}

module.exports = Post