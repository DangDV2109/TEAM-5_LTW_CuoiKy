import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Kết nối MongoDB thất bại: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
