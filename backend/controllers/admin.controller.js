const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');



class AdminController {
    
    // ✅ Get Total User Count
    async getTotalUserCount(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            return apiResponse(res, 200, "Total user count retrieved", totalUsers);
        } catch (error) {
            return apiResponse(res, 500, "Error fetching total users", error);
        }
    }

    // ✅ Get Total Online Users (Assuming an 'isOnline' field in the User schema)
    async getOnlineUserCount(req, res) {
        try {
            const onlineUsers = await User.countDocuments({ isOnline: true });
            return apiResponse(res, 200, "Total online users retrieved", onlineUsers);
        } catch (error) {
            return apiResponse(res, 500, "Error fetching online users", error);
        }
    }

    // ✅ Get Total Posts Count
    async getTotalPostCount(req, res) {
        try {
            const totalPosts = await Post.countDocuments();
            return apiResponse(res, 200, "Total post count retrieved", totalPosts);
        } catch (error) {
            return apiResponse(res, 500, "Error fetching total posts", error);
        }
    }

    // ✅ Get Total Comments Count
    async getTotalCommentCount(req, res) {
        try {
            const totalComments = await Comment.countDocuments();
            return apiResponse(res, 200, "Total comment count retrieved", totalComments);
        } catch (error) {
            return apiResponse(res, 500, "Error fetching total comments", error);
        }
    }

    // ✅ Get User's Total Active Hours (Assuming 'activeHours' field in User schema)
    async getUserTotalActiveHours(req, res) {
        try {
            if (!req.body.userId) {
                return apiResponse(res, 400, "Validation error: userId is required");
            }

            const user = await User.findById(req.body.userId).select('activeHours');

            if (!user) {
                return apiResponse(res, 404, "User not found");
            }

            return apiResponse(res, 200, "User total active hours retrieved", user.activeHours);
        } catch (error) {
            return apiResponse(res, 500, "Error fetching active hours", error);
        }
    }
}

module.exports = new AdminController();
