// Import express, the database connection, and other necessary modules
const express = require('express');
const connectDB = require('./config/db');  // Import the database connection function
const cors = require('cors');  // CORS middleware for handling cross-origin requests
const app = express();
const session = require("express-session");
const passport = require("passport");
const responseMiddleware = require('./utils/responses')
app.use(responseMiddleware);
// Middleware setup

app.use(cors({
    origin: "https://frontend-rm2tl9wox-ankurs-projects-33779db2.vercel.app",  // Allow frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true  // Allow cookies & auth headers
}));
app.use(express.json());  // Parse incoming requests with JSON payloads

connectDB()
 app.use(session({ secret: process.env.FACEBOOK_APP_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require("./routes/auth.route");
app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/user',require('./routes/user.route'))
app.use('/api/v1/post',require('./routes/post.route'))
app.use('/api/v1/comment',require('./routes/comment.route'))


// Export the app for use in server.js
module.exports = app;
