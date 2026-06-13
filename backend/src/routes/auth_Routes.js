import express from "express";
import passport from "passport";
import { googleCallback, logout, getMe } from "../controller/auth_controller.js";
import { protect } from "../middleware/protect_middleware.js";


const router = express.Router();

// 1. Trigger Google Authentication
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// 2. Google Authentication Callback (Redirect URI)
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login?error=oauth_failed" }), googleCallback);

// 3. Logout
router.post("/logout", logout);

// 4. Get Current User Profile (Protected)
router.get("/me", protect, getMe);

export default router;

