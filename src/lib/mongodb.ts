import mongoose from 'mongoose';

export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('Successfully connected to MongoDB');
    } else {
      console.log('MongoDB connection already established');
    }
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('MongoDB connection error:', error.message);
  } else {
    console.error('MongoDB connection error:', error);
  }
}

}