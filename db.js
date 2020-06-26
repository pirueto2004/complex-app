const dotenv = require("dotenv")
dotenv.config()

//Open a connection to a MongoDB database
const mongodb = require('mongodb')

//Store Database in a variable
const database_name  = process.env.DATABASE_NAME

//Port for the server to listen
let port = process.env.PORT

//Environment variable for mongoDB database password
const mongodbPassword = process.env.MONGOPASSWORD

//Connection string
const MONGODB_URI = process.env.CONNECTIONSTRING

//Connecting our app to mongoDB Atlas
mongodb.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
  
    //Exports our MongoDB database object
    module.exports = client

    //Require the app to start listening
    const app = require('./app')

    //Once MongoDB establishes a connection, server starts listening on port PORT
    app.listen(port, () => console.log(`Server listening on PORT ${port}`))
})