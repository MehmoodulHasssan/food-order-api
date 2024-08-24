import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendVerificationMail from '../helpers/sendVerificationMail.js';
// import AdminOrders from '../models/AdminPannel.js';
import { ObjectId } from 'mongodb';
import { Order } from '../models/Order.js';
import { calcTotalPrice } from '../helpers/CalcTotalPrice.js';

export const signupController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ msg: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user = new User({
    email: req.body.email,
    password: hashedPassword,
    fullName: req.body.fullName,
    city: req.body.city,
    address: req.body.address,
    phone: req.body.phone,
  });
  const token = jwt.sign({ email: req.body.email }, process.env.TOKEN_KEY, {
    expiresIn: '1h',
  });

  const savedUser = await user.save();
  const mailResponse = await sendVerificationMail({
    email: req.body.email,
    emailType: 'VERIFY',
    userId: savedUser._id,
  });
  if (mailResponse.rejected.length > 0) {
    return res.status(500).json({ msg: 'email not sent' });
  }

  return res.status(201).json({ msg: 'user created', token: token });
};

export const loginController = async (req, res) => {
  console.log(req.body.email);
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ msg: 'Email does not exist' });
  }

  const compare = await bcrypt.compare(req.body.password, user.password);
  if (!compare) {
    return res.status(400).json({ msg: 'Incorrect password' });
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

export const verifyController = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ msg: 'invalid URL' });
  }
  let user = await User.findOne({
    verifyToken: token,
    verifyTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(404).json({ msg: 'user not found or time is expired' });
  }

  (user.isVerified = true),
    (user.verifyToken = undefined),
    (user.verifyTokenExpiry = undefined),
    await user.save();

  res.status(200).json({ msg: 'user successfully verified' });
};

export const logoutController = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({ msg: 'logged out successfully' });
};

export const forgotPasswordController = async (req, res) => {
  const email = req.body.email;
  const isExist = await User.findOne({ email: email });
  if (!isExist) {
    return res.status(400).json({ msg: 'email does not exists' });
  }

  const mailResponse = await sendVerificationMail({
    email: isExist.email,
    emailType: 'RESET',
    userId: isExist._id,
  });
  if (mailResponse.rejected.length > 0) {
    return res.status(500).json({ msg: 'email not sent' });
  }
  return res.status(200).json({ msg: 'have sent you an email' });
};

export const newPasswordController = async (req, res) => {
  const newPassword = req.body.password;
  const token = req.body.token;

  const isUser = await User.findOne({
    forgotPasswrodToken: token,
    forgotPasswrodTokenExpiry: { $gt: Date.now() },
  });

  if (!isUser) {
    return res.status(400).json({ msg: 'session expired' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  isUser.password = hashedPassword;
  isUser.forgotPasswrodTokenExpiry = undefined;
  isUser.forgotPasswrodToken = undefined;

  // try {
  await isUser.save();
  return res.status(200).json({ msg: 'password updated successfully' });
  // } catch (error) {
  //   res.status(500).json({ msg: 'Something went wrong' });
  // }
};

export const placeOrderController = async (req, res) => {
  const userId = new ObjectId(req.user.id);
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ msg: 'no customer registered yet' });
  }

  let items = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ msg: 'No food items were selected' });
  }

  items = items.map((item) => {
    return {
      ...item,
      _id: new ObjectId(item._id),
    };
  });

  const totalPrice = calcTotalPrice(items);

  try {
    const newOrder = await Order.create({
      user: userId,
      items,
      totalPrice,
    });
    console.log(newOrder);
    return res.status(201).json({ msg: 'order submitted' });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Failed to save order' });
  }
};
