const jwt = require("jsonwebtoken");
const User = require('../models/user')
// Middleware to check if user is authenticated


const verifyToken = (req, res, next) => {
    // Try to get token from cookies first
    const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        console.log(error.message);
        res.status(403).json({ message: "Invalid Token" });
    }
};




// Middleware to check user role

const authorizeRole = (roles) => {
    return async (req, res, next) => {
        try {
            const userId = req.body.userId || req.params.userId || req.headers["user-id"]; // Get userId from request

            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }

            const user = await User.findById(userId); // Fetch user from DB
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: "Access Forbidden: Insufficient Permissions" });
            }

            req.user = user; // Attach user to req for further use
            next();
        } catch (error) {
            console.error("Authorization Error:", error);
            res.status(500).json({ message: "Server error during authorization" });
        }
    };
};

 const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.cookies?._vercel_jwt; // ✅ Extract token from cookie
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. No token found." });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password"); // ✅ Attach user to request

        if (!req.user) {
            return res.status(401).json({ message: "User not found." });
        }

        next(); // ✅ Proceed to the next middleware
    } catch (error) {
        return res.status(401).json({ message: "Invalid token.", error: error.message });
    }
};




module.exports = { verifyToken, authorizeRole ,isAuthenticated};
