const Post= require('../models/posts')
const mongoose = require('mongoose')

class postController{

    async createPost(req, res) {
        try {
            const { userId, title, content } = req.body;
    
            if (!userId) {
                return res.apiResponse({ status: 400, message: "User ID is required" });
            }
    
            // Create a new post
            const post = new Post({
                _id: new mongoose.Types.ObjectId(),
                user: userId,
                title,
                content,
            });
            await post.save();
    
            // ✅ Populate user details for real-time notification
            const populatedPost = await Post.findById(post._id).populate("user", "name");
    
            // ✅ Emit the "newPost" event via Socket.io
            req.app.get("io").emit("newPost", populatedPost);
    
            res.apiResponse({ data: populatedPost, message: "Post created successfully", status: 201 });
        } catch (error) {
            res.apiResponse({ status: 500, message: "Post creation failed", error: error.message });
        }
    }


// Get all posts
async getPosts(req, res) {
    try {
      const{userId} = req.params
        const posts = await Post.find({}).populate("user", "name email");
        res.apiResponse({ data: posts, message: "Posts retrieved successfully" });
    } catch (error) {
        res.apiResponse({ status: 500, message: "Failed to fetch posts", error: error.message });
    }
}

// Update a post
async updatePosts(req, res) {
    try {
        const { postId} = req.params;
       
        const post = await Post.findByIdAndUpdate(postId, { $set: req.body }, { new: true }) .populate("user", "name "); 

        if (!post) {
            return res.apiResponse({ status: 404, message: "Post not found" });
        }

        res.apiResponse({ data: post, message: "Post updated successfully" });
    } catch (error) {
        res.apiResponse({ status: 500, message: "Failed to update post", error: error.message });
    }
}

// Delete a post
async deletePosts(req, res) {
    try {
        const { postId } = req.params;
        const post = await Post.findByIdAndDelete(postId);

        if (!post) {
            return res.apiResponse({ status: 404, message: "Post not found" });
        }

        res.apiResponse({ data: post, message: "Post deleted successfully" });
    } catch (error) {
        res.apiResponse({ status: 500, message: "Failed to delete post", error: error.message });
    }
}

}

module.exports = postController


  
