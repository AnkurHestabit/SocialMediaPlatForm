import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";

const Chat = ({ onClose }) => {
    const { messages, sendMessage, activeChat, user } = useContext(ChatContext);
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim()) {
            sendMessage({
                text: message,
                sender: user.userId,
                recipientId: activeChat.userId, // Ensure the correct recipient
            });
            setMessage("");
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
                ✖
            </button>
            <h2 className="text-xl font-semibold mb-4">Chat with {activeChat?.username}</h2>

            <div className="h-60 overflow-y-auto p-2 border rounded">
                  {messages.map((msg) => (
                  <div key={msg.id || msg.timestamp} className="mb-2">
                  <span className="font-bold">{msg.sender}: </span>
             {msg.text}
           </div>
           ))}
         </div>


            <div className="mt-4 flex">
                <input type="text" className="flex-1 p-2 border rounded-l" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="bg-blue-500 text-white px-4 rounded-r" onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
