import { useEffect, useState, useContext, useCallback, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPostManually, fetchComments, removePost, updatePost } from "../redux/slices/postsSlice";
import { SocketContext } from "../context/SocketContext";
import { ChatContext } from "../context/ChatContext";
import CreatePostForm from "./PostForm";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { toast } from "react-toastify";
import { Heart, MessageCircle, Trash2, Edit3, Users } from "lucide-react";

const Chat = lazy(() => import("../pages/chat"));

const PostList = () => {
    const { posts } = useSelector((state) => state.posts);
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);
    const { activeChat, setActiveChat, onlineUsers, notifications } = useContext(ChatContext);

    const [showCreatePost, setShowCreatePost] = useState(false);
    const [activePost, setActivePost] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [updatedTitle, setUpdatedTitle] = useState("");
    const [updatedContent, setUpdatedContent] = useState("");
    const [showOnlineUsers, setShowOnlineUsers] = useState(false); // To toggle online users list

    const user = useSelector((state) => state.auth.user);
    const userId = user?._id;

    useEffect(() => {
      
        if (!socket || !user) return;
        socket.emit("userOnline", { userId: user._id, username: user.name });

        const handleNewPost = (newPost) => {
            if (newPost.user._id !== user._id) {
                dispatch(addPostManually(newPost));
                toast.info(`${newPost.user?.name || "Someone"} posted: ${newPost.title}`);
            }
        };

        socket.on("newPost", handleNewPost);
        return () => socket.off("newPost", handleNewPost);
    }, [socket, dispatch, user]);

    const handleDeletePost = useCallback((postId) => {
        if (window.confirm("Delete this post?")) {
            dispatch(removePost(postId));
            socket.emit("deletePost", postId);
        }
    }, [dispatch, socket]);

    const handleEditPost = (post) => {
        setEditingPost(post);
        setUpdatedTitle(post.title);
        setUpdatedContent(post.content);
    };

    const handleUpdatePost = (e) => {
        e.preventDefault();
        const updatedPost = { ...editingPost, title: updatedTitle, content: updatedContent };
        dispatch(updatePost({ postId: editingPost._id, postDetails: updatedPost }));
        socket.emit("updatePost", { postId: editingPost._id, updatedPost });
        setEditingPost(null);
        setUpdatedTitle("");
        setUpdatedContent("");
    };

    const toggleComments = (postId) => {
        setActivePost((prev) => (prev === postId ? null : postId));
        if (activePost !== postId) {
            dispatch(fetchComments(postId));
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            {/* Main Content */}
            <main className="container mx-auto p-4 pt-20">
                {/* Create Post Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowCreatePost((prev) => !prev)}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition"
                    >
                        {showCreatePost ? "Cancel" : "Create Post"}
                    </button>
                </div>

                {/* Create Post Form */}
                {showCreatePost && (
                    <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700 mb-6">
                        <CreatePostForm onClose={() => setShowCreatePost(false)} />
                    </div>
                )}

                {/* Posts Section */}
                <div className="space-y-6">
                    {posts.map(post => (
                        <div key={post._id} className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <img
                                    src={post.user?.profilePic || "https://via.placeholder.com/40"}
                                    className="w-12 h-12 rounded-full border object-cover"
                                />
                                <h3 className="text-md font-semibold">{post.user?.name || "Anonymous"}</h3>
                                {post.user._id === userId && (
                                    <div className="ml-auto flex space-x-2">
                                        <button onClick={() => handleEditPost(post)}>
                                            <Edit3 className="text-blue-400 w-6 h-6" />
                                        </button>
                                        <button onClick={() => handleDeletePost(post._id)}>
                                            <Trash2 className="text-red-400 w-6 h-6" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-300 font-medium">{post.title}</p>
                            <p className="text-gray-400 mt-1">{post.content}</p>

                            <div className="flex space-x-4 mt-3">
                                <button className="flex items-center space-x-1 text-red-400 hover:scale-110 transition">
                                    <Heart className="w-6 h-6" /> <span>Like</span>
                                </button>
                                <button
                                    className="flex items-center space-x-1 text-blue-400 hover:scale-110 transition"
                                    onClick={() => toggleComments(post._id)}
                                >
                                    <MessageCircle className="w-6 h-6" /> <span>Comment</span>
                                </button>
                            </div>

                            {activePost === post._id && (
                                <div className="border-t mt-4 pt-4">
                                    <div className="p-4">
                                        <CommentList postId={post._id} comments={post.comments || []} />
                                    </div>
                                    <CommentForm postId={post._id} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Edit Post Modal */}
            {editingPost && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 w-96">
                        <form onSubmit={handleUpdatePost}>
                            <input
                                type="text"
                                value={updatedTitle}
                                onChange={(e) => setUpdatedTitle(e.target.value)}
                                className="w-full p-3 border border-gray-600 rounded-md focus:outline-none text-gray-800"
                            />
                            <textarea
                                value={updatedContent}
                                onChange={(e) => setUpdatedContent(e.target.value)}
                                className="w-full p-3 border border-gray-600 rounded-md focus:outline-none resize-none text-gray-800"
                            />
                            <div className="flex justify-between mt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingPost(null)}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-4 py-2 rounded-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Always Visible Online Users Button */}
            <div
                className="fixed right-4 bottom-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-full shadow-lg cursor-pointer z-50"
                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            >
                <Users className="w-6 h-6" />
            </div>

            {/* Online Users List */}
            {showOnlineUsers && (
                <div className="fixed right-4 bottom-20 bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-700 w-72 z-50">
                    <h2 className="text-lg font-bold mb-2">Online Users</h2>
                    <ul>
                        {onlineUsers.length > 0 ? (
                            onlineUsers.map((user) => {
                                const isCurrentUser = user.id === userId;
                                const unreadCount = notifications[user.id] || 0; // Get unread message count

                                return (
                                    <li
                                        key={user._id}
                                        className={`flex items-center p-2 rounded-lg ${
                                            isCurrentUser ? "cursor-default" : "cursor-pointer hover:bg-gray-800"
                                        }`}
                                        onClick={() => {
                                            if (!isCurrentUser) {
                                                setActiveChat(user); // Only set active chat if it's not the current user
                                            }
                                        }}
                                    >
                                        <img
                                            src={user.profilePic || "https://via.placeholder.com/40"}
                                            className="w-10 h-10 rounded-full mr-2 border"
                                        />
                                        <span>{isCurrentUser ? "You" : user.name}</span>
                                        {unreadCount > 0 && ( // Show notification badge
                                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <p className="text-gray-500">No users online</p>
                        )}
                    </ul>
                </div>
            )}

            {/* Chat Section */}
            {activeChat && (
                <Suspense fallback={<div className="text-center p-4">Loading chat...</div>}>
                    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg">
                        <Chat user={activeChat} onClose={() => setActiveChat(null)} />
                    </div>
                </Suspense>
            )}
        </div>
    );
};

export default PostList;