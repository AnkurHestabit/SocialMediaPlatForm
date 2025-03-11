const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  _id:{ type: String, required: true },
    text: { type: String, required: true },
    user: { type: String, ref: 'User', required: true },
    post: { type: String, ref: 'Post', required: true }
  }, { timestamps: true });
  
  const Comment = mongoose.model('Comment', CommentSchema);
  module.exports = Comment
  