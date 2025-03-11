import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children, user }) => {
    const socket = useContext(SocketContext);
    const [messages, setMessages] = useState({}); // Store messages per user
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeChat, setActiveChat] = useState(null); 

    useEffect(() => {
        if (!socket || !user) return;

        socket.emit("userConnected", { id: user._id, name: user.name });

        socket.on("updateOnlineUsers", (users) => {
            setOnlineUsers(users);
        });

        socket.on("receiveMessage", (message) => {
            setMessages((prev) => ({
                ...prev,
                [message.sender]: [...(prev[message.sender] || []), message],
            }));
        });

        return () => {
            socket.off("updateOnlineUsers");
            socket.off("receiveMessage");
        };
    }, [socket, user]);

    const sendMessage = ({ text, recipientId }) => {
        if (socket) {
            const messageData = {
                text,
                sender: user._id,
                recipient: recipientId,
                timestamp: new Date().toISOString(),
            };

            socket.emit("sendMessage", messageData);

            setMessages((prev) => ({
                ...prev,
                [recipientId]: [...(prev[recipientId] || []), messageData],
            }));
        }
    };

    const startChat = (user) => {
        setActiveChat(user);
    };

    return (
        <ChatContext.Provider value={{ 
            messages: messages[activeChat?.userId] || [], 
            sendMessage, 
            onlineUsers, 
            startChat, 
            activeChat, 
            setActiveChat, 
            user 
        }}>
            {children}
        </ChatContext.Provider>
    );
};
