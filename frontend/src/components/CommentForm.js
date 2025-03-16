import { useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addComment } from "../redux/slices/postsSlice";
import { SocketContext } from "../context/SocketContext";
import { toast } from "react-toastify";

const CommentForm = ({ postId }) => {
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);
    const user = useSelector((state) => state.auth.user);

    const [commentText, setCommentText] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("User not found. Please log in.");
            return;
        }

        const trimmedComment = commentText.trim();
        if (!trimmedComment) {
            toast.error("Comment cannot be empty.");
            return;
        }

        try {
            const newComment = { postId, text: trimmedComment, userId: user._id };
            dispatch(addComment(newComment));
            socket.emit("newComment", { postId, comment: newComment });

            setCommentText(""); // ✅ Clear input after submission
            toast.success(`💬 ${user.name} commented: "${trimmedComment}"`);
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment. Please try again.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit} // ✅ Moved function inside to capture latest state
            className="flex items-center space-x-2 border border-gray-600 rounded-lg p-3 bg-gray-900 shadow-md"
        >
            <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-3 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
            />
            <button
                type="submit"
                disabled={!commentText.trim()} // ✅ Only enable if there's a comment
                className={`px-5 py-2 rounded-lg font-semibold transition ${
                    commentText.trim()
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
            >
                💬 Comment
            </button>
        </form>
    );
};

export default CommentForm;
