const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = require('./app')
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust for frontend
        methods: ["GET", "POST"]
    }
});

app.set("io", io); // ✅ Store io instance in app

let onlineUsers = {}; // Store online users
console.log(onlineUsers,'online')

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle user connection
    socket.on("userConnected", (user) => {
        if (user && user.id) {
            onlineUsers[socket.id] = { id: user.id, name: user.name };
            io.emit("updateOnlineUsers", Object.values(onlineUsers)); // Send updated list to all users
        }
    });

     // ✅ Handle user coming online
     socket.on("userOnline", ({ userId, username }) => {
        if (userId) {
            onlineUsers[userId] = { userId, username, socketId: socket.id };
            
        }
        io.emit("onlineUsers", Object.values(onlineUsers)); // Broadcast to all users
    });

    // Listen for new posts
    socket.on("newPost", (post) => {
        io.emit("newPost", post);
    });

    // Listen for new comments
    socket.on("newComment", (comment) => {
        io.emit("newComment", comment);
    });

    socket.on("sendMessage", ({ text, sender, recipient }) => {
        const recipientSocket = Object.values(onlineUsers).find(user => user.userId === recipient)?.socketId;
    
        if (recipientSocket) {
            io.to(recipientSocket).emit("receiveMessage", { text, sender, recipient });
        }
    });
    
    

    // ✅ Handle user disconnect
    socket.on("disconnect", () => {
        const userId = Object.keys(onlineUsers).find((key) => onlineUsers[key].socketId === socket.id);
        if (userId) {
            console.log(`${onlineUsers[userId].username} went offline.`);
            delete onlineUsers[userId]; // Remove from online list
        }
        io.emit("onlineUsers", Object.values(onlineUsers)); // Broadcast updated list
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
