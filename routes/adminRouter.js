import express from 'express';
import { authForOrders } from '../middlewares/auth.js';
import { check, validationResult } from 'express-validator';
import {
  adminLoginController,
  approveController,
  declineController,
  getDetailsController,
  getOrdersController,
} from '../controllers/adminControllers.js';
const adminRouter = express.Router();

adminRouter.post(
  '/login',
  [
    check('email', 'enter a valid email').isEmail(),
    check('password', 'write minimum 6 characters').isLength({ min: 6 }),
  ],
  adminLoginController
);

adminRouter.get('/orders', authForOrders, getOrdersController);

adminRouter.get('/order-details/:id', authForOrders, getDetailsController);

adminRouter.post('/approve/:id', approveController);

adminRouter.post('/decline/:id', declineController);
export default adminRouter;
