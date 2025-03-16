import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../redux/slices/postsSlice";
import { motion } from "framer-motion";

const CreatePostForm = ({ onClose }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const userId = user?._id;

    // ✅ Handle form submission efficiently
    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        if (!userId) {
            alert("User not found. Please log in.");
            return;
        }

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle || !trimmedContent) {
            alert("Title and content cannot be empty.");
            return;
        }

        dispatch(addPost({ userId, title: trimmedTitle, content: trimmedContent }));
        setTitle("");
        setContent("");
        onClose(); // ✅ Close modal after successful submission
    }, [dispatch, title, content, userId, onClose]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md z-50">
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative bg-black text-white p-6 rounded-2xl shadow-2xl w-full max-w-md"
            >
                <h2 className="text-xl font-bold text-center text-gray-200">Create Post</h2>

                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-4 text-gray-400 hover:text-white transition"
                >
                    ✕
                </button>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <input
                        type="text"
                        placeholder="Title"
                        className="w-full p-3 border border-gray-700 bg-gray-900 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Write your post..."
                        className="w-full p-3 border border-gray-700 bg-gray-900 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none h-32"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            type="button"
                            className="text-gray-400 px-4 py-2 rounded-md hover:text-white transition"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-6 py-2 rounded-full text-white font-semibold transition ${
                                title.trim() && content.trim() 
                                ? "bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 hover:scale-105 shadow-lg" 
                                : "bg-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!title.trim() || !content.trim()}
                        >
                            Post
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreatePostForm;
