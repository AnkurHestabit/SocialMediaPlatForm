import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";

const Chat = ({ onClose }) => {
    const { messages, sendMessage, activeChat, user, startChat } = useContext(ChatContext);
    const [message, setMessage] = useState("");

    // Clear notifications when the chat is opened
    useEffect(() => {
        if (activeChat) {
            startChat(activeChat); // Clear notifications for the active chat
        }
    }, [activeChat, startChat]);

    // Filter messages for the active chat
    const chatMessages = [
        ...(messages[activeChat?.id] || []), // Messages sent to the active chat
        ...(messages[user._id] || []).filter((msg) => msg.sender === activeChat?.id), // Messages received from the active chat
    ];

    const handleSend = () => {
        if (message.trim() && activeChat) {
            sendMessage({
                text: message,
                recipientId: activeChat.id,
            });
            setMessage(""); // Clear the input field
        }
    };

    return (
        <div className="fixed right-4 top-16 bottom-4 w-80 bg-gray-900 p-4 shadow-lg border-l border-gray-700 rounded-xl z-50">
            {/* Close Button */}
            <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={onClose}
            >
                ✖
            </button>

            {/* Chat Header */}
            <h2 className="text-lg font-bold mb-2">Chat with {activeChat?.name}</h2>

            {/* Messages List */}
            <div className="h-60 overflow-y-auto bg-gray-800 p-2 rounded-md">
                {chatMessages.map((msg, index) => (
                    <div
                        key={`${msg.sender}-${msg.recipient}-${msg.timestamp || index}`} // Unique key
                        className={`mb-2 ${msg.sender === user._id ? "text-right" : "text-left"}`}
                    >
                        <span className="font-bold">
                            {msg.sender === user._id ? "You" : activeChat.name}:
                        </span>
                        <span className="ml-2">{msg.text}</span>
                    </div>
                ))}
            </div>

            {/* Message Input */}
            <div className="flex items-center mt-2">
                <input
                    type="text"
                    className="flex-1 p-2 bg-gray-700 rounded-md text-white"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            handleSend();
                        }
                    }}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2"
                    onClick={handleSend}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;