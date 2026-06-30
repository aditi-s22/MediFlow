import mongoose from "mongoose";

// Connects to MongoDB using the connection string stored in .env
// We keep this in its own file so server.js doesn't get cluttered,
// and so any future script (like a seeder) can reuse the same logic.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // stop the app — it's useless without a DB
  }
};

export default connectDB;
