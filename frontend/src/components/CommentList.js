import { useDispatch } from "react-redux"
import { removeComment, updateComment } from "../redux/slices/postsSlice";
import { useContext, useMemo, useCallback, useState, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";

const CommentList = ({ postId, comments = [] }) => {
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);

    // ✅ Memoize user data to avoid unnecessary JSON parsing
    const storedUser = useMemo(() => {
        const user = sessionStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }, []);

    const userId = storedUser?._id;

    // New state for editing a comment
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedText, setEditedText] = useState("");
    const [localComments, setLocalComments] = useState(comments); // Local state to manage comments

    // Check if comments are passed correctly
    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);

    // ✅ Use useCallback to prevent unnecessary re-renders
    const handleDelete = useCallback(
        (commentId) => {
            if (window.confirm("Are you sure you want to delete this comment?")) {
                dispatch(removeComment({ postId, commentId }));
                socket.emit("deleteComment", { postId, commentId });

                // Immediately update local state to remove the comment from the UI
                setLocalComments((prevComments) => prevComments.filter(comment => comment._id !== commentId));
            }
        },
        [dispatch, socket, postId]
    );

    const handleEditClick = (comment) => {
        setEditingCommentId(comment._id);
        setEditedText(comment.text);
    };

    const handleEditCancel = () => {
        setEditingCommentId(null);
        setEditedText("");
    };

    const handleEditSubmit = (e, commentId) => {
        e.preventDefault();
        const updatedComment = {
            ...localComments.find(comment => comment._id === commentId),
            text: editedText
        };

        // Immediately update local state to show the change
        setLocalComments((prevComments) =>
            prevComments.map((comment) =>
                comment._id === commentId ? { ...comment, text: editedText } : comment
            )
        );

        // Dispatch the action to update the comment in the backend
        dispatch(updateComment({ postId, commentId, updatedComment }));

        // Emit the updated comment to the server via socket
        socket.emit("updateComment", { postId, commentId, updatedComment });

        // Close the edit form
        setEditingCommentId(null);
        setEditedText("");
    };

    // Listen for the updateComment socket event
    useEffect(() => {
        socket.on("updateComment", (updatedCommentData) => {
            console.log("Received updated comment:", updatedCommentData);
            setLocalComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === updatedCommentData._id ? { ...comment, text: updatedCommentData.text } : comment
                )
            );
        });

        socket.on("deleteComment", (commentId) => {
            // If a comment is deleted via socket, update the local comments
            setLocalComments((prevComments) => prevComments.filter(comment => comment._id !== commentId));
        });

        return () => {
            socket.off("updateComment");
            socket.off("deleteComment");
        };
    }, [socket]);

    return (
        <div className="space-y-4">
            {localComments.length > 0 ? (
                localComments.map((comment) => (
                    <div key={comment._id} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm">
                        <div>
                            <p className="text-sm text-gray-600">
                                <strong>{comment.user?.name ||storedUser.name || "Anonymous"}</strong>
                            </p>

                            {/* Conditionally render the edit form or comment */}
                            {editingCommentId === comment._id ? (
                                <form onSubmit={(e) => handleEditSubmit(e, comment._id)} className="space-y-2">
                                    <textarea
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        className="w-full p-2 mt-2 border rounded"
                                        required
                                    />
                                    <div className="flex space-x-2">
                                        <button type="submit" className="text-blue-500 hover:text-blue-700">
                                            Save
                                        </button>
                                        <button type="button" onClick={handleEditCancel} className="text-gray-500 hover:text-gray-700">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <p className="text-gray-800">{comment.text}</p>
                            )}
                        </div>

                        {/* Edit/Delete buttons */}
                        {comment.user._id === userId && !editingCommentId && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditClick(comment)}
                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(comment._id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No comments yet.</p>
            )}
        </div>
    );
};

// ✅ Default props to prevent issues if `comments` is undefined
CommentList.defaultProps = {
    comments: [],
};

export default CommentList;
