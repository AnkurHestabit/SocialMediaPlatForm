import { useState, useCallback, useMemo, useContext } from "react";
import { useDispatch } from "react-redux";
import { addComment } from "../redux/slices/postsSlice";
import { SocketContext } from "../context/SocketContext";
import { toast } from "react-toastify";

const CommentForm = ({ postId }) => {
    const [commentText, setCommentText] = useState("");
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);

    // ✅ Memoize user data to avoid unnecessary parsing
    const storedUser = useMemo(() => {
        const user = sessionStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }, []);

    const userId = storedUser?._id;

    // ✅ Memoize submission handler to prevent re-renders
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            if (!userId) {
                alert("User not found. Please log in.");
                return;
            }

            const trimmedComment = commentText.trim();
            if (!trimmedComment) {
                alert("Comment cannot be empty.");
                return;
            }

            try {
                const newComment = { postId, text: trimmedComment, userId };
                dispatch(addComment(newComment));
                setCommentText(""); // ✅ Clear input after submission
                toast.success(`💬 ${storedUser.name} commented: "${trimmedComment}"`)
        
            } catch (error) {
                console.error("Error adding comment:", error);
            }
        },
        [userId, commentText, postId, dispatch, socket]
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center space-x-2 border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
        >
            <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
                type="submit"
                disabled={!commentText.trim()} // ✅ Disable button if input is empty
                className={`px-4 py-2 rounded-lg transition ${
                    commentText.trim()
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
                💬 Comment
            </button>
        </form>
    );
};

export default CommentForm;
