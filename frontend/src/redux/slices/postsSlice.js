import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPostsByUser, createPost, createComment, getCommentsByPostId, deleteComment, deletePost, updatePostApi ,updateComments} from "../../services/api";

// Fetch all posts for a user
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (userId, thunkAPI) => {
    try {
        const { data } = await getPostsByUser(userId);
        return data.data; 
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || "Error fetching posts");
    }
});

// Fetch comments for a specific post
export const fetchComments = createAsyncThunk("posts/fetchComments", async (postId, thunkAPI) => {
    try {
        const { data } = await getCommentsByPostId(postId);
        return { postId, comments: data.data }; 
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || "Error fetching comments");
    }
});

// Create a new post
export const addPost = createAsyncThunk("posts/addPost", async (postDetails, thunkAPI) => {
    try {
        const { data } = await createPost(postDetails);
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || "Error creating post");
    }
});

// Add a new comment to a post
export const addComment = createAsyncThunk("posts/addComment", async ({ postId, text, userId }, thunkAPI) => {
    try {
        const { data } = await createComment(postId, text, userId);
        return { postId, comment: data.data };
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || "Error adding comment");
    }
});

// ✅ Remove Comment Thunk
export const removeComment = createAsyncThunk("posts/removeComment", async ({ postId, commentId }, thunkAPI) => {
    try {
        await deleteComment(commentId);
        return { postId, commentId };
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || "Error deleting comment");
    }
});


// In your postsSlice.js
export const updateComment = createAsyncThunk(
    "posts/updateComment",
    async ({ postId, commentId, updatedComment }, thunkAPI) => {
        try {
            await updateComments(postId,commentId,updatedComment)
            return { postId, commentId };
        } catch (error) {
            return thunkAPI.rejectWithValue("Error updating comment");
        }
    }
);


// ✅ Remove Post Thunk
export const removePost = createAsyncThunk("posts/removePost", async (postId, thunkAPI) => {
    try {
        await deletePost(postId);
        return postId;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || "Error deleting post");
    }
});

// ✅ Update Post Thunk (new addition)
export const updatePost = createAsyncThunk("posts/updatePost", async ({postId,postDetails}, thunkAPI) => {
    try {
       
        const { data } = await updatePostApi(postId,postDetails); 
        return data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || "Error updating post");
    }
});

const postsSlice = createSlice({
    name: "posts",
    initialState: {
        posts: [],
        loading: false,
        error: null,
        commentsLoading: false,
    },
    reducers: {
        addPostManually: (state, action) => {
            state.posts.unshift(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Posts
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Comments
            .addCase(fetchComments.pending, (state) => {
                state.commentsLoading = true;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.commentsLoading = false;
                const { postId, comments } = action.payload;
                state.posts = state.posts.map((post) =>
                    post._id === postId ? { ...post, comments } : post
                );
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.commentsLoading = false;
                state.error = action.payload;
            })

            // Add Post
            .addCase(addPost.fulfilled, (state, action) => {
                state.posts.unshift(action.payload);
            })

            // Add Comment
            .addCase(addComment.fulfilled, (state, action) => {
                const { postId, comment } = action.payload;
                state.posts = state.posts.map((post) =>
                    post._id === postId
                        ? { ...post, comments: [...(post.comments || []), comment] }
                        : post
                );
            })

            // ✅ Remove Comment
            .addCase(removeComment.fulfilled, (state, action) => {
                const { postId, commentId } = action.payload;
                state.posts = state.posts.map((post) =>
                    post._id === postId
                        ? { ...post, comments: post.comments.filter((comment) => comment._id !== commentId) }
                        : post
                );
            })

            // ✅ Remove Post
            .addCase(removePost.fulfilled, (state, action) => {
                state.posts = state.posts.filter((post) => post._id !== action.payload);
            })

            // ✅ Update Post
            .addCase(updatePost.fulfilled, (state, action) => {
                const updatedPost = action.payload;
                state.posts = state.posts.map((post) =>
                    post._id === updatedPost._id ? { ...post, ...updatedPost } : post
                );
            });
    },
});

export const { addPostManually } = postsSlice.actions;
export default postsSlice.reducer;
