const request = require('supertest');
const app = require('../app');  // Your Express app
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('User Controller Tests', () => {
  let userId, authToken;

  beforeAll(async () => {
    // Create a user for authentication
    const password = await bcrypt.hash('testpassword123', 10);
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: 'testuser@example.com',
      password,
    });
    await user.save();
    userId = user._id;

    // Generate auth token for the created user
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  });

  afterAll(async () => {
    // Clean up database and close connection after tests
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test case for creating a new user
  test('should create a new user', async () => {
    const newUser = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'newpassword123',
    };

    const response = await request(app)
      .post('/api/v1/user/addUser')  // Adjust the route as per your setup
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('email', newUser.email);
    expect(response.body.data).toHaveProperty('name', newUser.name);
  });

  // Test case for getting all users
  test('should retrieve all users', async () => {
    const response = await request(app)
      .get('/api/v1/user/getUserProfile')  // Adjust route based on your app
      .set('Authorization', `Bearer ${authToken}`);  // Send the auth token

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // Test case for updating a user
  test('should update user details', async () => {
    const updatedData = {
      id: userId,
      name: 'Updated User',
    };

    const response = await request(app)
      .patch(`/api/v1/user/updateUser/${userId}`)  // Adjust the route as per your setup
      .send(updatedData)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('_id', userId.toString());
    expect(response.body.data).toHaveProperty('name', updatedData.name);
  });

  // Test case for user registration (with validation)
  test('should register a new user with validation', async () => {
    const newUser = {
      name: 'Valid User',
      email: 'validuser@example.com',
      password: 'validpassword123',
    };

    const response = await request(app)
      .post('/api/v1/user/register')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.data).toHaveProperty('_id');
  });

  // Test case for user login
  test('should login user with valid credentials', async () => {
    const loginData = {
      email: 'testuser@example.com',
      password: 'testpassword123',
    };

    const response = await request(app)
      .post('/api/v1/user/login')
      .send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user).toHaveProperty('_id', userId.toString());
  });

  // Test case for fetching a user's profile
  test('should fetch user profile', async () => {
    const response = await request(app)
      .get(`/api/v1/user/getUserProfile/${userId}`)  // Adjust the route as per your setup
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('_id', userId.toString());
    expect(response.body.data).toHaveProperty('email', 'testuser@example.com');
  });

});
