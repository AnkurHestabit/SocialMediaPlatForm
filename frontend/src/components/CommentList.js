import { useDispatch, useSelector } from "react-redux";
import { removeComment, updateComment } from "../redux/slices/postsSlice";
import { useContext, useState, useEffect, useCallback } from "react";
import { SocketContext } from "../context/SocketContext";

const CommentList = ({ postId, comments = [] }) => {
   
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);
    const user = useSelector((state) => state.auth.user); // ✅ Get user from Redux

    const [localComments, setLocalComments] = useState(comments);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedText, setEditedText] = useState("");

    const userId = user?._id; // ✅ Logged-in user ID from Redux

    // ✅ Only update `localComments` when `comments` actually change
    useEffect(() => {
        if (JSON.stringify(localComments) !== JSON.stringify(comments)) {
            setLocalComments(comments);
        }
    }, [comments]);

    // ✅ Memoized delete handler
    const handleDelete = useCallback((commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            dispatch(removeComment({ postId, commentId }));
            socket.emit("deleteComment", { postId, commentId });

            setLocalComments((prev) => prev.filter((comment) => comment._id !== commentId));
        }
    }, [dispatch, socket, postId]);

    const handleEditClick = (comment) => {
        setEditingCommentId(comment._id);
        setEditedText(comment.text || comment.message || "");
    };

    const handleEditCancel = () => {
        setEditingCommentId(null);
        setEditedText("");
    };

    const handleEditSubmit = (e, commentId) => {
        e.preventDefault();
        const updatedComment = { text: editedText };

        setLocalComments((prev) =>
            prev.map((comment) => (comment._id === commentId ? { ...comment, text: editedText } : comment))
        );

        dispatch(updateComment({ postId, commentId, updatedComment }));
        socket.emit("updateComment", { postId, commentId, updatedComment });

        setEditingCommentId(null);
        setEditedText("");
    };

    // ✅ Handle socket events efficiently
    useEffect(() => {
        const handleUpdateComment = (updatedComment) => {
            setLocalComments((prev) =>
                prev.map((comment) =>
                    comment._id === updatedComment._id ? { ...comment, text: updatedComment.text } : comment
                )
            );
        };

        const handleDeleteComment = (commentId) => {
            setLocalComments((prev) => prev.filter((comment) => comment._id !== commentId));
        };

        socket.on("updateComment", handleUpdateComment);
        socket.on("deleteComment", handleDeleteComment);

        return () => {
            socket.off("updateComment", handleUpdateComment);
            socket.off("deleteComment", handleDeleteComment);
        };
    }, [socket]);

    return (
        <div className="space-y-4">
            {localComments.length > 0 ? (
                localComments.map((comment) => (
                    <div key={comment._id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg shadow-sm text-white">
                        <div>
                            <p className="text-sm text-gray-300">
                                <strong>{comment.user?.name || "Anonymous"}</strong>
                            </p>

                            {editingCommentId === comment._id ? (
                                <form onSubmit={(e) => handleEditSubmit(e, comment._id)} className="space-y-2">
                                    <textarea
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        className="w-full p-2 mt-2 border rounded bg-gray-900 text-white"
                                        required
                                    />
                                    <div className="flex space-x-2">
                                        <button type="submit" className="text-blue-400 hover:text-blue-500">Save</button>
                                        <button type="button" onClick={handleEditCancel} className="text-gray-400 hover:text-gray-500">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <p className="text-gray-300">{comment.text || comment.message || "Invalid comment format"}</p>
                            )}
                        </div>

                        {comment.user?._id === userId && !editingCommentId && (
                            <div className="flex space-x-2">
                                <button onClick={() => handleEditClick(comment)} className="text-blue-400 hover:text-blue-500 text-sm">✏️ Edit</button>
                                <button onClick={() => handleDelete(comment._id)} className="text-red-400 hover:text-red-500 text-sm">🗑 Delete</button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-gray-400">No comments yet.</p>
            )}
        </div>
    );
};

export default CommentList;
