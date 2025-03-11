const request = require('supertest');
const app = require('../../app');  // Your Express app
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/posts');
const Comment = require('../models/comment');

describe('Comment Controller Tests', () => {
  let userId, postId, commentId;

  beforeAll(async () => {
    const user = { 
    _id:new mongoose.Types.ObjectId(),  
    name: 'Test User1', 
    email: 'testuser1@example.com', 
    password: 'testpassword123'  // Assuming a password is required for registration
    }; 
    const res = await request(app).post('/api/v1/user/register').send(user);  // Adjust this to your user registration endpoint
    userId = res.body.data._id;  // Save the userId for use in tests
    userId = user._id;

    // Create a post
    const post = new Post({
      title: 'Test Post',
      content: 'This is a test post content.',
      user: userId,
    });
    await post.save();
    postId = post._id;
  });

  afterAll(async () => {
    // Clean up database and close connection after tests
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test case for creating a comment
  test('should create a new comment', async () => {
    const newComment = {
      postId,
      text: 'This is a test comment.',
      userId,
    };

    const response = await request(app)
      .post('/api/v1/comment/addComment')  // Adjust the route as per your setup
      .send(newComment);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('text', newComment.text);
    expect(response.body.data).toHaveProperty('post', postId.toString());
    expect(response.body.data).toHaveProperty('user', userId.toString());

    commentId = response.body.data._id;  // Save commentId for further tests
  });

  // Test case for fetching all comments for a post
  test('should retrieve all comments for a post', async () => {
    const response = await request(app).get(`/api/v1/comment/getComment/${postId}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // Test case for updating a comment
  test('should update an existing comment', async () => {
    const updatedText = 'This is an updated test comment.';
    const response = await request(app)
      .patch(`/api/v1/comment/update/${commentId}`)
      .send({
        id: commentId,
        text: updatedText,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('_id', commentId);
    expect(response.body.data).toHaveProperty('text', updatedText);
  });

  // Test case for deleting a comment
  test('should delete a comment', async () => {
    const response = await request(app).delete(`/api/v1/comment/deleteComment/${commentId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Comment deleted successfully');

    // Ensure the comment is deleted
    const comment = await Comment.findById(commentId);
    expect(comment).toBeNull();
  });

});
