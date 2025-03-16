import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children, user }) => {
    const socket = useContext(SocketContext);
    const [messages, setMessages] = useState({}); // Store messages per user
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [notifications, setNotifications] = useState({}); // Track unread messages

    useEffect(() => {
        if (!socket || !user) return;

        // Notify server that the user is connected
        socket.emit("userConnected", { id: user._id, name: user.name });

        // Message event handler
        const handleReceiveMessage = (message) => {
            setMessages((prev) => ({
                ...prev,
                [message.sender]: [...(prev[message.sender] || []), message],
            }));

            // Add notification if the sender is not the current user
            if (message.sender !== user._id) {
                setNotifications((prev) => ({
                    ...prev,
                    [message.sender]: (prev[message.sender] || 0) + 1,
                }));
            }
        };

        // Online users event handler
        const handleUpdateOnlineUsers = (users) => {
            const normalizedUsers = users.map(user => ({
                id: user.id || user.userId, // Use `id` if available, otherwise `userId`
                name: user.name || user.username, // Use `name` if available, otherwise `username`
                socketId: user.socketId,
            }));
        
            setOnlineUsers(normalizedUsers);
        };
        

        // Attach event listeners
        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("updateOnlineUsers", handleUpdateOnlineUsers);

        // Cleanup listeners on unmount
        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("updateOnlineUsers", handleUpdateOnlineUsers);
        };
    }, [socket, user]); // Only run when socket or user changes

    // Function to send a message
    const sendMessage = ({ text, recipientId }) => {
        if (socket) {
            const messageData = {
                text,
                sender: user._id,
                recipient: recipientId,
                timestamp: new Date().toISOString(),
            };

            // Emit the message to the server
            socket.emit("sendMessage", messageData);

            // Update local state with the sent message
            setMessages((prev) => ({
                ...prev,
                [recipientId]: [...(prev[recipientId] || []), messageData],
            }));
        }
    };

    // Function to start a chat with a user
    const startChat = (user) => {
        setActiveChat(user);
        // Clear notifications for this user when the chat is opened
        setNotifications((prev) => ({
            ...prev,
            [user.id]: 0, // Reset notification count
        }));
    };

    return (
        <ChatContext.Provider
            value={{
                messages, // Pass the entire messages object
                sendMessage,
                onlineUsers,
                startChat, // Pass startChat function
                activeChat,
                setActiveChat,
                user,
                notifications, // Pass notifications to components
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
