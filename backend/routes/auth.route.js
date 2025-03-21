const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require('../models/user')
require("../config/passport");

const router = express.Router();

// Google Auth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
    passport.authenticate("google", { session: false }), 
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.redirect(`https://socialmediaplatform-dmhm.onrender.com/auth-success?token=${token}`);
    }
);

// Facebook Auth
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get("/facebook/callback", 
    passport.authenticate("facebook", { session: false }), 
    async(req, res) => {
        // ✅ Generate Access Token (valid for 15 minutes)
        const accessToken = jwt.sign(
            { id: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // ✅ Generate Refresh Token (valid for 7 days)
        const refreshToken = jwt.sign(
            { id: req.user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ Save tokens in the database
        await User.findByIdAndUpdate(req.user._id, {
            token: accessToken,
            refreshToken: refreshToken
        });

        // ✅ Store tokens as HTTP-only cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            domain: ".socialmediaplatform-dmhm.onrender.com",
            path: "/",
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

        // ✅ Redirect to frontend with token in URL
        res.redirect(`https://frontend-f8d1c23yd-ankurs-projects-33779db2.vercel.app/auth-success?token=${accessToken}`);
    }
);




router.get("/me", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // Exclude password
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;
