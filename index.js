import { connectDb } from './configure/connectDb.js';
import express from 'express';
import { foodItem } from './models/foodItem.js';
import userRouter from './routes/userRouter.js';
import cors from 'cors';
import { authForMeals } from './middlewares/auth.js';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/adminRouter.js';
import dotenv from 'dotenv';
import ApiError from './helpers/ApiError.js';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8080;

// console.log(process.memoryUsage());
//Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.options('*', cors()); // Preflight request handling
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static('public'));

connectDb();

app.use('/user', userRouter);
app.use('/admin', adminRouter);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    console.log(err);
    //the commented out form is considered as a best practice
    // return res.status(err.status).json({ error: err.message });
    return res.status(err.status).json({ message: err.message });
  }
  console.log(err.message);
  return res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`server is listening at ${PORT}...`));
