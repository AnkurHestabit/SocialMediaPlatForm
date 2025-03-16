const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = require('./app');
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const io = new Server(server, {
    cors: {
        origin: "https://frontend-l2bxyzbw9-ankurs-projects-33779db2.vercel.app", // Use your frontend URL
        methods: ["GET", "POST"]
    }
});

app.set("io", io); // Store io instance in app

let onlineUsers = {}; // Store online users by userId

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle user connection
    socket.on("userConnected", (user) => {
        if (user?.id) {
            // Add user to onlineUsers with userId as the key
            onlineUsers[user.id] = { id: user.id, name: user.name, socketId: socket.id };
            console.log(`${user.name} is online.`);
            io.emit("updateOnlineUsers", Object.values(onlineUsers)); // Send updated list to all users
        }
    });

    // Handle user coming online
    socket.on("userOnline", ({ userId, username }) => {
        if (userId) {
            onlineUsers[userId] = { userId, username, socketId: socket.id };
            console.log(`${username} is online.`);
            io.emit("onlineUsers", Object.values(onlineUsers)); // Broadcast to all users
        }
    });

    // Listen for new posts
    socket.on("newPost", (post) => {
        io.emit("newPost", post);
    });

    // Listen for new comments
    socket.on("newComment", (comment) => {
        io.emit("newComment", comment);
    });

    // Handle sending messages
    socket.on("sendMessage", ({ text, sender, recipient }) => {
        const recipientSocket = onlineUsers[recipient]?.socketId; // Find recipient's socket ID
        if (recipientSocket) {
            io.to(recipientSocket).emit("receiveMessage", { text, sender, recipient });
        }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        const userId = Object.keys(onlineUsers).find((key) => onlineUsers[key].socketId === socket.id);
        if (userId) {
            console.log(`${onlineUsers[userId].name} went offline.`);
            delete onlineUsers[userId]; // Remove user from online list
            io.emit("updateOnlineUsers", Object.values(onlineUsers)); // Broadcast updated list
        }
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});