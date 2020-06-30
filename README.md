# Complex-app

## Inspiration

This app was created as part of the Udemy "Learn JavaScript: Full-Stack from Scratch" online course by instructor Brad Schiff completed on June 25, 2020.

This project is aimed basically to create a system for sharing posts. Every user has to sign up for an account in order to be able to create, publish, edit, and  delete their posts. Users can follow other users and be followed by them as well. A real-time chat feature is included in the app. Every time a user creates a post the administrator receives an email with the username that created the post.

![Results](./public/images/screen-capture.png)

The app is built in the Node.js environment. We used Express to organize our app on the server side. For the back-end we used a cloud-based MongoDB database created in MongoDB Atlas. EJS Templating Engine is used to generate the HTML markup. The chat feature was built with Socket.io and for the email feature we use SendGrid. 

## Techologies used

No JS frameworks were used in the development of the client side of this application. All functionality was built with EJS templating engine so feel free to dive into the code.

The project is created with: 

* CSS3 
* HTML5
* JavaScript
* Bootstrap 4.1.3
* Node.js
* Express.js
* MongoDB
* EJS
* Webpack & Babel
* Socket.Io
* SendGrid

## Heroku

We used the cloud-based Heroku Platform to deploy and run the app.

##  Available scripts

In the project directory, you can run:

### `npm run build`

Builds the app for production to the `public` folder.<br>
It correctly bundles the JS files into a main-bundled.js file in production mode and optimizes the build for the best performance.

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

