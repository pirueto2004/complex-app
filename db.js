const dotenv = require("dotenv")
dotenv.config()

//Open a connection to a MongoDB database
const mongodb = require('mongodb')

//Store Database in a variable
// const database_name  = process.env.DATABASE_NAME

//Port for the server to listen
let port = process.env.PORT || 3000

//Environment variable for mongoDB database password
// const mongodbPassword = process.env.MONGOPASSWORD

//Connection string
// const connectionString = `mongodb+srv://todoAppUser:${mongodbPassword}@jbcluster-v5kqr.mongodb.net/${database_name}?retryWrites=true&w=majority`
let connectionString = process.env.CONNECTIONSTRING

//if there's a shell environment variable named MONGODB_URI (deployed), use it; otherwise, connect to MongoDB Atlas database
let dbUrl = process.env.MONGODB_URI || connectionString
// const dbUrl = connectionString

//Connecting our app to mongoDB Atlas
mongodb.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {

    //Exports our MongoDB database object
    module.exports = client

    //Require the app to start listening
    const app = require('./app')

    //Once MongoDB establishes a connection, server starts listening on port PORT
    // app.listen(port, () => console.log(`Server listening on PORT ${port}`))
    app.listen(port, () => console.log(`Server listening on PORT ${port}`))
})