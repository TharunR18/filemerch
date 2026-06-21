import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
            `${process.env.BACKEND_URL || "http://localhost:3000"}/api/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({
                google_id: profile.id,
            });

            if (!user) {    
                user = await User.create({
                    google_id: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar_url: (profile.photos && profile.photos.length > 0) ? profile.photos[0].value : null,
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
)
);

export default passport;