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
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        await User.findByIdAndUpdate(req.user._id ,{
            token:token
        })
        // res.redirect(`https://socialmediaplatform-dmhm.onrender.com/auth-success?token=${token}`);
        res.redirect(`http://localhost:3000/auth-success?token=${token}`);
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
