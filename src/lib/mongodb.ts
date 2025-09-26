import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB;