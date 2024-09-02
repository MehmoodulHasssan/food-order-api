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
  origin: 'https://food-order-khaki.vercel.app', // Frontend URL
  credentials: true, // Allow credentials like cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  optionsSuccessStatus: 200 // Response status for successful OPTIONS requests
}));

// app.options('*', cors({
//   origin: 'https://food-order-khaki.vercel.app', // Frontend URL
//   credentials: true, // Allow credentials like cookies
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed methods
//   allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
//   optionsSuccessStatus: 200 // Response status for successful OPTIONS requests
// })); // Preflight request handling
// app.use((req, res, next) => {
//   const allowedOrigins = ['https://food-order-khaki.vercel.app', 'http://192.168.1.5:3000'];
//   const origin = req.headers.origin;
//   console.log(origin);
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//     res.setHeader('Access-Control-Allow-Credentials', true);
//   }
//   if (req.method === 'OPTIONS') {
//     res.setHeader(
//       'Access-Control-Allow-Methods',
//       'GET,HEAD,PUT,PATCH,POST,DELETE'
//     );
//     res.setHeader(
//       'Access-Control-Allow-Headers',
//       'Content-Type, Authorization'
//     );
//     return res.status(204).end();
//   }
//   next();
// });
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static('public'));

connectDb();

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.get('/', async(req, res) => {
  res.send('hello from backend')
})

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
