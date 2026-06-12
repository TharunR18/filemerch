import jwt from "jsonwebtoken";


// Handle Google OAuth callback: issues JWT and redirects to client dashboard
export function googleCallback(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }

  // Generate JWT token
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

  // Set HTTP-Only Cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Redirect to frontend dashboard
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(`${clientUrl}`);
}


//Logout and clear token cookie
export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ success: true, message: "Logged out successfully" });
}

//Get current user profile (using protect middleware)
export async function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  return res.json({
    success: true,
    user: req.user.toPublicProfile(),
  });
}
