import { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { addPost } from "../redux/slices/postsSlice";

const CreatePostForm = ({ onClose }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const dispatch = useDispatch();

    // ✅ Store user data in a memoized value
    const storedUser = useMemo(() => {
        const user = sessionStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }, []);

    const userId = storedUser?._id;

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
        <div className="bg-white p-4 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    className="w-full p-3 border rounded-lg"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Content"
                    className="w-full p-3 border rounded-lg resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <div className="flex justify-between">
                    <button
                        type="button"
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`px-4 py-2 rounded ${title.trim() && content.trim() ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                        disabled={!title.trim() || !content.trim()}
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePostForm;
