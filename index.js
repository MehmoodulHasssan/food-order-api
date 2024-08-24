import { connectDb } from './configure/connectDb.js';
import express from 'express';
import { foodItem } from './models/foodItem.js';
import userRouter from './routes/userRouter.js';
import cors from 'cors';
import { authForMeals } from './middlewares/auth.js';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/adminRouter.js';

const app = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true, // Allows cookies to be sent
  })
);
app.use(express.static('public'));

app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
//connectDatabase
connectDb();

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.get('/user/items', authForMeals, async (req, res) => {
  try {
    const items = await foodItem.find();
    if (!items) {
      return res.status(404).json({ msg: 'no items found' });
    }
    res.json(items);
  } catch (error) {
    console.log('Error', error);
  }
});

app.listen(8080, () => console.log('server is listening...'));
