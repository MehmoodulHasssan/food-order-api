import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendOrderMail from '../helpers/sendOrderMail.js';
import { check, validationResult } from 'express-validator';
import { Order } from '../models/Order.js';
import ApiError from '../helpers/ApiError.js';

export const adminLoginController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
      isAdmin: true,
    });
    if (!user) {
      throw ApiError.badRequest('Invalid Credentials');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.TOKEN_KEY,
      {
        expiresIn: '12h',
      }
    );
    res.cookie('token', token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: true, // Ensures the cookie is sent only over HTTPS
      maxAge: 43200000, // Cookie expiration time in milliseconds
    });
    return res.status(200).json({ msg: 'cookie sent' });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.internal('Failed to login'));
  }
};

export const getOrdersController = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      throw ApiError.unauthorized('You are not an admin');
    }

    const items = await Order.find().populate('user', 'fullName');
    return res.status(200).json({ data: items });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.internal('Server Error'));
  }
};

export const getDetailsController = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const isOrder = await Order.findById(orderId)
      .populate('items.foodItem')
      .populate('user', ['fullName', 'address', 'phone']);
    if (!isOrder) {
      throw ApiError.badRequest('Order not found');
    }
    return res.status(200).json({ data: isOrder });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.internal('Server Error'));
  }
};
export const approveController = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email');
    if (!order) {
      throw ApiError.badRequest('Order not found');
    }
    if (order.status === 'approved') {
      throw ApiError.badRequest('Order already approved');
    }

    order.status = 'approved';
    await order.save();
    await sendOrderMail({
      email: order.user.email,
      emailType: 'approved',
    });
    return res.status(201).json({ msg: 'order approved successfully' });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.internal('Server Error'));
  }
};

export const declineController = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email');
    if (!order) {
      throw ApiError.badRequest('Order not found');
    }
    if (order.status === 'declined') {
      throw ApiError.badRequest('Order already declined');
    }
    order.status = 'declined';
    await order.save();
    await sendOrderMail({
      email: order.user.email,
      emailType: 'declined',
    });
    return res.status(201).json({ msg: 'order declined' });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.internal('Server Error'));
  }
};
