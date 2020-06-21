//Require hashing package
const bcrypt = require('bcryptjs')

//Users collections
const usersCollection = require('../db').db().collection('users')

//Require the validator
const validator = require('validator')

//Require the hashing package md5
const md5 = require('md5')

//Constructor function for User
let User = function(data, getAvatar) {
    this.data = data
    this.errors = []
    if (getAvatar == undefined) { getAvatar = false }
    if (getAvatar) {this.getAvatar()}
}

User.prototype.cleanUp = function() {
    //If username is anything other than a string
    if (typeof(this.data.username) != "string") { this.data.username = ""}
    //If email is anything other than a string
    if (typeof(this.data.email) != "string") { this.data.email = ""}
    //If password is anything other than a string
    if (typeof(this.data.password) != "string") { this.data.password = ""}

    //Get rid of any bogus properties that user may enter
    //so we overwrite the data property and trim any empty spaces at the beginning or end of the string and convert to lower cases
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        //spaces and lower and upper cases are allowed in passwords
        password: this.data.password
    }
}

User.prototype.validate = function() {
    return new Promise(
        //Here we use an arrow function so it doesn't change the 'this' keyword from where it is currently pointing towards
        async (resolve, reject) => {

            //If username field is left blank
            if (this.data.username == "") {
                //Push an error string into the errors array
                this.errors.push("You must provide a username.")
            }
        
            //If username is NOT blank and is NOT a valid alphanumeric string
            if (this.data.username !== "" && !validator.isAlphanumeric(this.data.username)) {
                //Push an error string into the errors array
                this.errors.push("Username can only contain letters and numbers.")
            }
        
            //If email provided is NOT a valid email format
            if (!validator.isEmail(this.data.email)) {
                //Push an error string into the errors array
                this.errors.push("You must provide a valid email address.")
            }
        
            //If password field is left blank
            if (this.data.password == "") {
                //Push an error string into the errors array
                this.errors.push("You must provide a password.")
            }
        
            //If amount of characters in password is greater than 0 and less than 12
            if (this.data.password.length > 0 && this.data.password.length < 12) {
                //Push an error string into the errors array
                this.errors.push("Password must be at least 12 characters long.")
            }
        
            //If password exceeds 50 characters
            if (this.data.password.length > 50) {
                //Push an error string into the errors array
                this.errors.push("Password cannot exceed 100 characters.")
            }
        
            //If amount of characters in username is greater than 0 and less than 3
            if (this.data.username.length > 0 && this.data.username.length < 3) {
                //Push an error string into the errors array
                this.errors.push("Username must be at least 3 characters long.")
            }
        
            //If username exceeds 30 characters
            if (this.data.username.length > 30) {
                //Push an error string into the errors array
                this.errors.push("Username cannot exceed 30 characters.")
            }
        
            //Only if username is valid then check to see if it is already taken
            if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
                let usernameExists = await usersCollection.findOne({username: this.data.username})
                if (usernameExists) {
                    this.errors.push("That username is already taken.")
                }
            }
        
             //Only if email is valid then check to see if it is already taken
            if (validator.isEmail(this.data.email)) {
                let emailExists = await usersCollection.findOne({email: this.data.email})
                if (emailExists) {
                    this.errors.push("That email is already being used.")
                }
            }

            resolve()
        }
    )
}

User.prototype.register = function() {
    return new Promise(
        //Here we use an arrow function so it doesn't change the 'this' keyword from where it is currently pointing towards
        async (resolve, reject) => {

            //Clean up user data
            this.cleanUp()
        
            //Validate user data. Validation will wait until it is complete to execute the next code
            await this.validate()
        
            //Only if there are no validations errors
            //then save the user data into database
        
            if (!this.errors.length) {
                //Hash user password: First step - Create the salt and Second step - Generate the hash
                let salt = bcrypt.genSaltSync(10)
                this.data.password = bcrypt.hashSync(this.data.password, salt)
                await usersCollection.insertOne(this.data)
                this.getAvatar()
                resolve()
            } else {
                //There are errors in the promise
                reject(this.errors)
            }
        }
    )
}

User.prototype.login = function() {

    return new Promise( (resolve, reject) => {
        //Clean up user data
        this.cleanUp()

        //Find a matching username in the database
        usersCollection.findOne({username: this.data.username}).then( (attemptedUser) => {
            //The arrow function guarantees that the 'this' keyword points towards the current object and not to the global object
            if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password) ){
                this.data = attemptedUser
                this.getAvatar()
                resolve('Congrats!!!')
            } else {
                reject('Invalid username / password')
            }
        }).catch(() => {
            reject("Please try again later.")
        })
    })
}



User.prototype.getAvatar = function() {
    this.avatar = `https://secure.gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function(username) {
    return new Promise( (resolve, reject) => {
        if (typeof(username) !== 'string') {
            reject()
            return
        }
        usersCollection.findOne({username: username}).then( (userDoc) => {
            if (userDoc) {
                userDoc = new User(userDoc, true)
                userDoc = {
                    _id: userDoc.data._id,
                    username: userDoc.data.username,
                    avatar: userDoc.avatar
                }
                resolve(userDoc)
            } else {
                reject()
            }

        }).catch( () => {
            //Rejection due to any type of technical error or database connection problem
            reject()

        })
    })
}

User.doesEmailExist = function(email) {
    return new Promise( async (resolve, reject) => {
        if (typeof(email) != "string") {
            resolve(false)
            return
        }

        let user = await usersCollection.findOne({email: email})
        if (user) {
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

module.exports = User