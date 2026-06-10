import express from "express";
import "dotenv/config";
import cors from "cors";
import db from "./config/db.js";

const app = express();
db();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("FileMerch API Running");
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "404 Route not found" })
})


app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})