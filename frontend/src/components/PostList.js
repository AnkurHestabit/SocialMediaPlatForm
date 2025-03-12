import { useEffect, useState, useContext, useCallback, useMemo, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPostManually, fetchComments, removePost, updatePost } from "../redux/slices/postsSlice";
import { SocketContext } from "../context/SocketContext";
import { ChatContext } from "../context/ChatContext";
import CreatePostForm from "./PostForm";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { toast } from "react-toastify";

const Chat = lazy(() => import("../pages/chat")); // ✅ Lazy Loading Chat

const PostList = () => {
    const { posts } = useSelector((state) => state.posts);
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);
    const { startChat, activeChat, setActiveChat } = useContext(ChatContext);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activePost, setActivePost] = useState(null);
    const [editingPost, setEditingPost] = useState(null); // New state for editing
    const [updatedTitle, setUpdatedTitle] = useState(""); // New state for updated title
    const [updatedContent, setUpdatedContent] = useState(""); // New state for updated content

    // ✅ Store user in a variable to prevent repeated JSON parsing
    const storedUser = useMemo(() => JSON.parse(sessionStorage.getItem("user")), []);
    const userId = storedUser?._id;

    useEffect(() => {
        if (!socket || !storedUser) return;

        socket.emit("userOnline", { userId: storedUser._id, username: storedUser.name });

    

        const handleNewPost = (newPost) => {
            if (newPost.user._id !== storedUser._id) {  // ✅ Ignore own post
                dispatch(addPostManually(newPost));
                toast.info(`${newPost.user?.name || "Someone"} posted: ${newPost.title}`, {
                    onClick: () => window.scrollTo(0, 0), // Clicking notification scrolls to top
                });
            }
        };
        
        const handleOnlineUsers = (users) => {
            setOnlineUsers(users.filter(user => user?.userId && user?.username));
        };
        const handleUserDisconnected = (disconnectedUserId) => {
            setOnlineUsers((prevUsers) => prevUsers.filter(user => user.userId !== disconnectedUserId));
        };

        socket.on("newPost", handleNewPost);
        socket.on("onlineUsers", handleOnlineUsers);
        socket.on("userDisconnected", handleUserDisconnected);

        return () => {
            socket.off("newPost", handleNewPost);
            socket.off("onlineUsers", handleOnlineUsers);
            socket.off("userDisconnected", handleUserDisconnected);
        };
    }, [socket, dispatch, storedUser]);

    // ✅ Memoize Online Users List
    const filteredOnlineUsers = useMemo(() => {
        return onlineUsers.filter(user => user?.userId && user?.username);
    }, [onlineUsers]);

    // ✅ Memoized Event Handlers
    const handleDeletePost = useCallback((postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            dispatch(removePost(postId));
            socket.emit("deletePost", postId);
        }
    }, [dispatch, socket]);

    const handleStartChat = useCallback((user) => {
        startChat(user);
        setActiveChat(user);
    }, [startChat, setActiveChat]);

    // Handle editing post
    const handleEditPost = (post) => {
        setEditingPost(post);
        setUpdatedTitle(post.title);
        setUpdatedContent(post.content);
    };

    const handleUpdatePost = (e) => {
        e.preventDefault();
        const updatedPost = { 
            ...editingPost, 
            title: updatedTitle, 
            content: updatedContent 
        };
      
        dispatch(updatePost({ postId: editingPost._id, postDetails:updatedPost })); // Pass postId and updatedPost
        socket.emit("updatePost", { postId: editingPost._id, updatedPost }); // Emit postId and updatedPost
        setEditingPost(null); // Close the editing form
        setUpdatedTitle(""); // Clear input
        setUpdatedContent(""); // Clear input
    };
    

    return (
        <div className="max-w-lg mx-auto space-y-6 relative">
            {/* ✅ Toggle Create Post Form */}
            <button
                onClick={() => setShowCreatePost(prev => !prev)}
                className="bg-blue-500 text-white px-4 py-2 rounded shadow-md w-full"
            >
                {showCreatePost ? "Cancel" : "Create Post"}
            </button>

            {showCreatePost && (
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300">
                    <CreatePostForm onClose={() => setShowCreatePost(false)} />
                </div>
            )}

            {/* ✅ Online Users List */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Online Users</h2>
                <ul className="mt-2 space-y-1">
                    {filteredOnlineUsers.length > 0 ? (
                        filteredOnlineUsers.map(user => (
                            <li key={user.userId} className="flex items-center space-x-3">
                                <span className={`w-2 h-2 ${user.userId === userId ? "bg-blue-500" : "bg-green-500"} rounded-full`}></span>
                                <p className="text-gray-800">
                                    {user.username} {user.userId === userId && "(You)"}
                                </p>
                                {user.userId !== userId && (
                                    <button
                                        className="ml-auto bg-blue-500 text-white px-2 py-1 rounded"
                                        onClick={() => handleStartChat(user)}
                                    >
                                        💬 Chat
                                    </button>
                                )}
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-500">No users online</p>
                    )}
                </ul>
            </div>

            {/* ✅ Posts List */}
            {posts.map(post => (
                <div key={post._id} className="bg-white rounded-lg shadow-md border border-gray-300 mb-6">
                    <div className="p-4 flex items-center justify-between">
                        <h3 className="text-md font-semibold">{post.user?.name || storedUser.name ||"Anonymous"}</h3>
                        {post.user=== userId && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditPost(post)}
                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDeletePost(post._id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        <p className="text-gray-800 font-medium">{post.title}</p>
                        <p className="text-gray-600 mt-1">{post.content}</p>
                    </div>

                    <button
                        className="flex items-center space-x-1 hover:text-blue-500 px-4 py-2"
                        onClick={() => {
                            setActivePost(prev => (prev === post._id ? null : post._id));
                            if (!post.comments) dispatch(fetchComments(post._id));
                        }}
                    >
                        💬 <span>Comment</span>
                    </button>

                    {activePost === post._id && (
                        <div className="border-t">
                            <div className="p-4">
                                <CommentList postId={post._id} comments={post.comments || []} />
                            </div>
                            <CommentForm postId={post._id} />
                        </div>
                    )}

                    {/* ✅ Inline Edit Form for the post */}
                    {editingPost?._id === post._id && (
                        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300 mt-4">
                            <h4 className="text-lg font-semibold">Edit Post</h4>
                            <form onSubmit={handleUpdatePost}>
                                <div className="mb-4">
                                    <label htmlFor="title" className="block text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={updatedTitle}
                                        onChange={(e) => setUpdatedTitle(e.target.value)}
                                        className="w-full p-2 mt-2 border rounded"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="content" className="block text-gray-700">Content</label>
                                    <textarea
                                        id="content"
                                        value={updatedContent}
                                        onChange={(e) => setUpdatedContent(e.target.value)}
                                        className="w-full p-2 mt-2 border rounded"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Update Post
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            ))}

            {/* ✅ Show Chat Component if Active */}
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
