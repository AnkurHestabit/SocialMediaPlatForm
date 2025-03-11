const request = require('supertest');
const app = require('../app'); // Your Express app
const mongoose = require('mongoose')
describe('Post Controller Tests', () => {
  let userId;
  let postId;

  beforeAll(async () => {
    const user = { 
        _id:new mongoose.Types.ObjectId(),  
      name: 'Test User1', 
      email: 'testuser1@example.com', 
      password: 'testpassword123'  // Assuming a password is required for registration
    }; 
    const res = await request(app).post('/api/v1/user/register').send(user);  // Adjust this to your user registration endpoint
    userId = res.body.data._id;  // Save the userId for use in tests
  });

  test('should create a new post', async () => {
    const newPost = {
      userId,
      title: 'Test Post Title',
      content: 'Test Post Content',
    };

    const response = await request(app)
      .post('/api/v1/post/addPost/')
      .send(newPost);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('title', newPost.title);
    expect(response.body.data).toHaveProperty('content', newPost.content);

    postId = response.body.data._id;
  });

  test('should retrieve all posts', async () => {
    const response = await request(app).get('/api/v1/post/getPost');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('should update an existing post', async () => {
    const updatedPost = {
      id: postId,
      title: 'Updated Test Post Title',
      content: 'Updated Test Post Content',
    };

    const response = await request(app)
      .patch(`/api/v1/post/updatePost/${postId}`)
      .send(updatedPost);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('title', updatedPost.title);
    expect(response.body.data).toHaveProperty('content', updatedPost.content);
  });

  test('should delete a post', async () => {
    const response = await request(app).delete(`/api/v1/post/deletePost/${postId}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('_id', postId);
  });
});
