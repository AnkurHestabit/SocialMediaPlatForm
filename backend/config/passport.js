const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/user");
const mongoose = require("mongoose");
require("dotenv").config();

// ✅ JWT Strategy (Protect Routes)
const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET, // ✅ Ensure this is set in .env
};

passport.use(
    new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

// ✅ Google Strategy
// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: "/api/v1/auth/google/callback",
//             scope: ["profile", "email"],
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 let user = await User.findOne({ googleId: profile.id });
//                 if (!user) {
//                     user = await User.create({
//                         _id: new mongoose.Types.ObjectId(),
//                         googleId: profile.id,
//                         name: profile.displayName,
//                         email: profile.emails?.[0]?.value || null,
//                     });
//                 }
//                 return done(null, user);
//             } catch (error) {
//                 return done(error, null);
//             }
//         }
//     )
// );

// ✅ Facebook Strategy
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: "https://socialmediaplatform-dmhm.onrender.com/api/v1/auth/facebook/callback",
            profileFields: ["id", "displayName", "emails"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ facebookId: profile.id });
                if (!user) {
                    user = await User.create({
                        _id: new mongoose.Types.ObjectId(),
                        facebookId: profile.id,
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value || null,
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// ✅ User Serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
