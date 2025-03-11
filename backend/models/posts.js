
const mongoose = require('mongoose')
const PostSchema = new mongoose.Schema({
  _id:{ type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: String, ref: 'User', required: true }
  }, { timestamps: true });
  
  const Post = mongoose.model('Post', PostSchema);
 module.exports = Post