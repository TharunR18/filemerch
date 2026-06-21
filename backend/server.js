import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./src/config/db.js";
import passport from "./src/config/passport.js";
import authRouter from "./src/routes/auth_Routes.js";
import sellerRouter from "./src/routes/seller_Routes.js";
import productRouter from "./src/routes/product_Routes.js";
import purchaseRouter from "./src/routes/purchase_Routes.js";
import reviewRouter from "./src/routes/review_Routes.js";


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
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON format" });
  }
  next(err);
});
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/products", productRouter);
app.use("/api/purchases", purchaseRouter);
app.use("/api/reviews", reviewRouter);

app.get("/", (req, res) => { res.send("FileMerch API Running"); });
app.use((req, res) => { res.status(404).json({ success: false, message: "404, Route not found" }) })



app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running successfully`);
})