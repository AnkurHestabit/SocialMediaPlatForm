const jwt = require("jsonwebtoken");

// Middleware to check if user is authenticated
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

// Middleware to check user role
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Forbidden: Insufficient Permissions" });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRole };
