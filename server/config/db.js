import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Now it safely reads from your clean .env file!
    const mongoURI = process.env.MONGO_URI;
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); 
  }
};

export default connectDB;