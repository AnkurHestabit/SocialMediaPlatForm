// api.js or axios setup file
import axios from "axios";
import store from "../redux/store";
import { updateToken, logout } from "../redux/slices/authSlice"; // ✅ Import actions

const API = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,
});



// ✅ Get token from Redux state dynamically
API.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state.auth?.accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// ✅ Intercept responses to handle token expiration
// Response interceptor to handle 401 errors
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const state = store.getState();
                const refreshToken = state.auth?.refreshToken;
                if (!refreshToken) {
                    store.dispatch(logout());
                    return Promise.reject("No refresh token available");
                }

                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/v1/user/refresh-token`,
                    { refreshToken },
                    { withCredentials: true } // Ensure session cookies are sent
                );

                const { accessToken } = response.data;
                store.dispatch(updateToken(accessToken));

                // ✅ Update headers properly
                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${accessToken}`,
                };

                return API(originalRequest); // Retry the request with new token
            } catch (refreshError) {
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }

        // If no access token, log out the user
        if (!store.getState().auth?.accessToken) {
            store.dispatch(logout());
        }

        return Promise.reject(error);
    }
);

export const loginUser = async (credentials) => {
    return await API.post("api/v1/user/login", credentials, { withCredentials: true });
};

export const registerUser = (userData) => API.post("api/v1/user/register", userData);
export const getUserProfile = () => API.get(`/api/v1/user/getUserProfile`);
export const logoutUser = () => API.post(`/api/v1/user/logout`);

// 🟢 Post APIs
export const getPostsByUser = () => API.get("/api/v1/post/getPost");
export const createPost = (postData) => API.post("/api/v1/post/addPost", postData);
export const deletePost = (postId) => API.delete(`/api/v1/post/deletePost/${postId}`);

// 🟢 Comment APIs
export const createComment = (postId, text, userId) => 
    API.post(`api/v1/comment/addComment`, { postId, text, userId });

export const getCommentsByPostId = (postId) => 
    API.get(`/api/v1/comment/getComment/${postId}`);

export const deleteComment = (commentId) => 
    API.delete(`/api/v1/comment/deleteComment/${commentId}`);

// 🟢 Update Post API
export const updatePostApi = (postId, postData) => 
    API.patch(`/api/v1/post/updatePost/${postId}`, postData);

// 🟢 Update Comment API
export const updateComments = (postId, commentId, commentData) => 
    API.patch(`/api/v1/comment/updateComment/${commentId}`, commentData);