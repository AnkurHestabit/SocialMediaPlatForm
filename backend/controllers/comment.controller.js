const Comment = require('../models/comment');
const Post = require('../models/posts');
const User = require('../models/user');
const mongoose = require('mongoose')

class CommentController {
  // Create a new comment
  async createComment(req, res) {
    try {
        const { postId, text, userId } = req.body;

        if (!postId || !text || !userId) {
            return res.apiResponse({ status: 400, message: "Post ID, User ID, and Comment Text are required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.apiResponse({ status: 404, message: "Post not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.apiResponse({ status: 404, message: "User not found" });
        }

        // Create new comment
        const comment = new Comment({
            _id: new mongoose.Types.ObjectId(),
            post: postId,
            text,
            user: userId,
        });
        await comment.save();

        // ✅ Populate user details for real-time notification
        const populatedComment = await Comment.findById(comment._id).populate("user", "name");

        // ✅ Emit the "newComment" event via Socket.io
        req.app.get("io").emit("newComment", { postId, comment: populatedComment });

        res.apiResponse({ data: populatedComment, message: "Comment created successfully", status: 201 });
    } catch (error) {
        res.apiResponse({ status: 500, message: "Comment creation failed", error: error.message });
    }
}


  // Get all comments
  async getComments(req, res) {
      try {
        const {postId} = req.params
          const comments = await Comment.find({post:postId}).populate('user')
             

          res.apiResponse({ data: comments, message: "Comments retrieved successfully" });
      } catch (error) {
          res.apiResponse({ status: 500, message: "Failed to fetch comments", error: error.message });
      }
  }

  // Update a comment
  async updateComments(req, res) {
      try {
          const { commentId } = req.params;
          const comment = await Comment.findByIdAndUpdate(commentId, { $set: req.body }, { new: true });

          if (!comment) {
              return res.apiResponse({ status: 404, message: "Comment not found" });
          }

          res.apiResponse({ data: comment, message: "Comment updated successfully" });
      } catch (error) {
          res.apiResponse({ status: 500, message: "Failed to update comment", error: error.message });
      }
  }

  // Delete a comment
  async deleteComments(req, res) {
      try {
          const { commentId } = req.params;
          const comment = await Comment.findByIdAndDelete(commentId);

          if (!comment) {
              return res.apiResponse({ status: 404, message: "Comment not found" });
          }

          res.apiResponse({ data: comment, message: "Comment deleted successfully" });
      } catch (error) {
          res.apiResponse({ status: 500, message: "Failed to delete comment", error: error.message });
      }
  }
}

module.exports = CommentController
