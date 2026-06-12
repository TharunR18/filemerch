import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./src/config/db.js";
import passport from "./src/config/passport.js";
import router from "./src/routes/auth_Routes.js";


const app = express();
db();

app.use(passport.initialize());


// CORS configured to support credentials (cookies)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


// Auth Routes
app.use("/api/auth", router);

app.get("/", (req, res) => {
  res.send("FileMerch API Running");
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "404, Route not found" })
})



app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})