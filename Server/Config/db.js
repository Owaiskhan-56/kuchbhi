import mongoose from "mongoose";

// This function connects our app to MongoDB Atlas
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    process.exit(1); // stop the app if the database is not connected
  }
};

export default connectDB;