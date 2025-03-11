import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

// ✅ Add token to requests if user is logged in (Updated to sessionStorage)
API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");  // 🔄 Get token from sessionStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 🟢 Authentication APIs
export const loginUser = (userData) => API.post("api/v1/user/login", userData);
export const registerUser = (userData) => API.post("api/v1/user/register", userData);
export const getUserProfile = () => API.get("api/v1/user/getUserProfile");

// 🟢 Post APIs
export const getPostsByUser = () => API.get("/api/v1/post/getPost");  // Get all posts by user
export const createPost = (postData) => API.post("/api/v1/post/addPost", postData);
export const deletePost = (postId) => API.delete(`/api/v1/post/deletePost/${postId}`); // ✅ Delete Post

// 🟢 Comment APIs
export const createComment = (postId, text, userId) => 
    API.post(`api/v1/comment/addComment`, { postId, text, userId });

export const getCommentsByPostId = (postId) => 
    API.get(`/api/v1/comment/getComment/${postId}`);

export const deleteComment = (commentId) => 
    API.delete(`/api/v1/comment/deleteComment/${commentId}`); // ✅ Delete Comment

// 🟢 Update Post API (new addition)
export const updatePostApi = (postId, postData) => 
    API.patch(`/api/v1/post/updatePost/${postId}`, postData); // PATCH request to update post

// 🟢 Update Post API (new addition)
export const updateComments = (postId,commentId, commentData) => 
    API.patch(`/api/v1/comment/updateComment/${commentId}`, commentData); // PATCH request to update post
