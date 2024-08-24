import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendOrderMail from '../helpers/sendOrderMail.js';
import { check, validationResult } from 'express-validator';
import { Order } from '../models/Order.js';

export const adminLoginController = async (req, res) => {
  console.log(req.body.email);
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
    return res.status(400).json({ msg: 'Invalid Credentials' });
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
};

export const getOrdersController = async (req, res) => {
  const admin = await User.findById(req.user.id);
  if (!admin) {
    return res.status(400).json({ msg: 'You are an admin' });
  }

  try {
    const items = await Order.find().populate('user', 'fullName');
    return res.status(200).json({ data: items });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const getDetailsController = async (req, res) => {
  const orderId = req.params.id;
  const isOrder = await Order.findById(orderId)
    .populate('items.foodItem')
    .populate('user', ['fullName', 'address', 'phone']);
  if (!isOrder) {
    return res.status(400).json({ msg: 'Order not found' });
  }

  return res.status(200).json({ data: isOrder });
};
export const approveController = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email');
  if (!order) {
    return res.status(400).json({ msg: 'Order not found' });
  }
  if (order.status === 'approved') {
    return res.status(400).json({ msg: 'Already approved' });
  }

  await sendOrderMail({
    email: order.user.email,
    emailType: 'approved',
  });
  order.status = 'approved';
  try {
    await order.save();
    return res.status(201).json({ msg: 'order approved successfully' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
};

export const declineController = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email');
  if (!order) {
    return res.status(400).json({ msg: 'Order not found' });
  }
  if (order.status === 'declined') {
    return res.status(400).json({ msg: 'Already declined' });
  }
  await sendOrderMail({
    email: order.user.email,
    emailType: 'declined',
  });
  order.status = 'declined';
  try {
    await order.save();
    return res.status(201).json({ msg: 'order declined' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server Error' });
  }
};
