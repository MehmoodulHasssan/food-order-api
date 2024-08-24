import express from 'express';
import { authForMeals } from '../middlewares/auth.js';
import { check, validationResult } from 'express-validator';
import {
  forgotPasswordController,
  loginController,
  logoutController,
  newPasswordController,
  placeOrderController,
  signupController,
  verifyController,
} from '../controllers/usersControllers.js';

const userRouter = express.Router();

userRouter.post(
  '/signup',
  [
    check('fullName', 'Name is required').notEmpty(),
    check('email', 'enter a valid email').isEmail(),
    check('password', 'write minimum 6 characters').isLength({ min: 6 }),
    check('address', 'address is required').notEmpty(),
    check('city', 'city is required').notEmpty(),
    check('phone', 'Invalid phone number').notEmpty(),
  ],
  signupController
);

userRouter.patch('/verifyemail', verifyController);
userRouter.post('/login', loginController);
userRouter.post('/logout', logoutController);
userRouter.post('/forgot-password', forgotPasswordController);
userRouter.post('/new-password', newPasswordController);
userRouter.post('/place-order', authForMeals, placeOrderController);

export default userRouter;
