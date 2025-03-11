const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt  = require( "jsonwebtoken")
const { validationResult }  = require( "express-validator")
const mongoose = require('mongoose')

class UserController {
    async createUser(req, res) {
        try {
            // Hash the password before saving
            const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // Create a new user with the hashed password
            const user = new User({ ...req.body, password: hashedPassword });
            await user.save();

            res.apiResponse({ data: user, message: "User created successfully", status: 201 });
        } catch (error) {
            res.apiResponse({ status: 500, message: "User creation failed", error: error.message });
        }
    }

    async getUsers(req, res) {
        try {
            const{userId} = req.params
            const users = await User.findBYId(userId);
            res.apiResponse({ data: users, message: "Users fetched successfully", status: 200 });
        } catch (error) {
            res.apiResponse({ status: 500, message: "Failed to fetch users", error: error.message });
        }
    }

    async updateUsers(req, res) {
        try {
            const{userId} = req.params
            const user = await User.findByIdAndUpdate(userId, { $set: req.body }, { new: true });

            if (!user) {
                return res.apiResponse({ status: 404, message: "User not found" });
            }

            res.apiResponse({ data: user, message: "User updated successfully", status: 200 });
        } catch (error) {
            res.apiResponse({ status: 500, message: "User update failed", error: error.message });
        }
    }

    async  registerUser(req, res) {
      try {
       
          // Validate request
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
              return res.apiResponse({ status: 400, message: "Validation errors", error: errors.array() });
          }
  
          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);
  
          // Create new user with explicit ObjectId
          const user = new User({ 
              _id: new mongoose.Types.ObjectId(),  
              ...req.body, 
              password: hashedPassword 
          });
  
          await user.save();
  
          res.apiResponse({ message: "User registered successfully", status: 201, data: user });
      } catch (error) {
          res.apiResponse({ status: 500, message: "User registration failed", error: error.message });
      }
    }

    

    async loginUser(req, res) {
        try {
            const user = await User.findOne({ email: req.body.email });

            if (!user) {
                return res.apiResponse({ status: 400, message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(req.body.password, user.password);

            if (!isMatch) {
                return res.apiResponse({ status: 400, message: "Invalid credentials" });
            }

            // Generate JWT Token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
            await User.findByIdAndUpdate(user._id,{
                token:token
            })

            res.apiResponse({ data: { token, user }, message: "Login successful", status: 200 });
        } catch (error) {
            res.apiResponse({ status: 500, message: "Login failed", error: error.message });
        }
    }

    async getUserProfile(req, res) {
        try {
            const user = await User.findById(req.user.id).select("-password"); // Exclude password

            if (!user) {
                return res.apiResponse({ status: 404, message: "User not found" });
            }

            res.apiResponse({ data: user, message: "User profile fetched successfully", status: 200 });
        } catch (error) {
            res.apiResponse({ status: 500, message: "Failed to fetch user profile", error: error.message });
        }
    }
}


module.exports = new UserController();
