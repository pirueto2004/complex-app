const postsCollection = require('../db').db().collection('posts')
//Require ObjectID from mongodb
const ObjectID = require('mongodb').ObjectID

let Post = function(data, userID) {
    this.data = data
    this.errors = []
    this.userID = userID
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

module.exports = Post