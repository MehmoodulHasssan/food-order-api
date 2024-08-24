import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

export const connectDb = async () => {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);

    const connection = mongoose.connection;
    connection.on('connected', () => {
      console.log('mongodb is connected');
    });
    // console.log('Mongo connected...');
    connection.on('error', (error) => {
      console.log('Error connecting with mongoDb ' + error);
      process.exit();
    });
  } catch (error) {
    console.log(error);
  }
};
