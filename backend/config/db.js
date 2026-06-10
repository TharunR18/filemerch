import "dotenv/config"
import mongoose from "mongoose";

const db = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log("MongoDB Connection Error: ", error);
        process.exit(1);
    }
}

export default db;