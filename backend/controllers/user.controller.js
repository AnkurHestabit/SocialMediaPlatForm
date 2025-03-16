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
            const users = await User.findById(userId);
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
            const { email, password } = req.body;
    
            // ✅ Find user by email
            const user = await User.findOne({ email });
    
            if (!user) {
                return res.apiResponse({ status: 400, message: "Invalid credentials" });
            }
    
            // ✅ Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.apiResponse({ status: 400, message: "Invalid credentials" });
            }
    
            // ✅ Generate Access Token (short-lived, e.g., 15 minutes)
            const accessToken = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "15m" } // Short expiry for security
            );
    
            // ✅ Generate Refresh Token (long-lived, e.g., 7 days)
            const refreshToken = jwt.sign(
                { id: user._id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "7d" } // Long expiry for refreshing access
            );
    

            user.token = accessToken
            // ✅ Save refresh token in the database
            user.refreshToken = refreshToken;
            await user.save();
    
            res.cookie("accessToken", accessToken, {
                httpOnly: true, // ✅ Prevents XSS attacks
                secure: process.env.NODE_ENV === "production", // ✅ Required for HTTPS
                sameSite: "None", // ✅ Required for cross-site cookies
                domain: ".socialmediaplatform-dmhm.onrender.com", // ✅ Use your actual domain
                path: "/", // ✅ Ensure it's available across routes
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "None",
                domain: ".socialmediaplatform-dmhm.onrender.com",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            
    
            // ✅ Send user data (without sensitive information)
            const userData = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
    
            res.apiResponse({
                data: { user: userData, accessToken, refreshToken },
                message: "Login successful",
                status: 200,
            });
        } catch (error) {
            res.apiResponse({ status: 500, message: "Login failed", error: error.message });
        }
    }


    async  refreshToken(req, res) {
        try {
            const { refreshToken } = req.cookies;
    
            if (!refreshToken) {
                return res.apiResponse({ status: 401, message: "Refresh token is required" });
            }
    
            // ✅ Verify the refresh token
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
            // ✅ Find the user and validate the refresh token
            const user = await User.findOne({ _id: decoded.id, refreshToken });
    
            if (!user) {
                return res.apiResponse({ status: 403, message: "Invalid refresh token" });
            }
    
            // ✅ Generate a new access token
            const accessToken = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "15m" } // Short expiry for security
            );
    
            res.cookie("accessToken", accessToken, {
                httpOnly: true, // ✅ Prevents XSS attacks
                secure: process.env.NODE_ENV === "production", // ✅ Required for HTTPS
                sameSite: "None", // ✅ Required for cross-site cookies
                domain: ".socialmediaplatform-dmhm.onrender.com", // ✅ Use your actual domain
                path: "/", // ✅ Ensure it's available across routes
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
           
            
    
            // ✅ Send the new access token
            res.apiResponse({ data: { accessToken }, message: "Token refreshed", status: 200 });
        } catch (error) {
            res.apiResponse({ status: 403, message: "Invalid refresh token", error: error.message });
        }
    }
    
    async logoutUser(req, res) {
        try {
            const { refreshToken } = req.cookies;
    
            // ✅ Clear both access and refresh token cookies correctly
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
            });
    
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
            });
    
            // ✅ Remove refresh token from database
            if (refreshToken) {
                const user = await User.findOne({ refreshToken });
    
                if (user) {
                    user.refreshToken = null; // Remove token
                    await user.save();
                }
            }
    
            // ✅ Send success response
            res.apiResponse({ message: "Logged out successfully", status: 200 });
        } catch (error) {
            res.apiResponse({ status: 500, message: "Logout failed", error: error.message });
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
