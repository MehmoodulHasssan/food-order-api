import { check, validationResult } from 'express-validator';
import ApiError from '../helpers/ApiError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendVerificationMail from '../helpers/sendVerificationMail.js';
import { foodItem } from '../models/foodItem.js';
import { ObjectId } from 'mongodb';
import { Order } from '../models/Order.js';
import calcTotalPrice from '../helpers/CalcTotalPrice.js';

export const signupController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest(errors.array());
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
      throw ApiError.badRequest('Order already declined');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user = User({
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

    await user.save();
    await sendVerificationMail({
      email: req.body.email,
      emailType: 'VERIFY',
      userId: savedUser._id,
    });
    return res.status(201).json({ msg: 'user created', token: token });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(ApiError.internal('Server Error'));
  }

  // if (mailResponse.rejected.length > 0) {
  //   return res.status(500).json({ msg: 'email not sent' });
  // }
};

export const loginController = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(ApiError.badRequest('Email does not exist'));
    }

    const compare = await bcrypt.compare(req.body.password, user.password);
    if (!compare) {
      return next(ApiError.badRequest('Incorrect password'));
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
    return next(ApiError.internal('Server Error'));
  }
};

export const verifyController = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      throw ApiError.badRequest('Invalid URL');
    }
    let user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      throw ApiError.badRequest('User not found or time expired');
    }

    (user.isVerified = true),
      (user.verifyToken = undefined),
      (user.verifyTokenExpiry = undefined),
      await user.save();

    res.status(200).json({ msg: 'user successfully verified' });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.internal('Server Error'));
  }
};

export const logoutController = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).json({ msg: 'logged out successfully' });
  } catch (error) {
    return next(ApiError.internal('Server Error'));
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const email = req.body.email;
    const isExist = await User.findOne({ email: email });
    if (!isExist) {
      throw ApiError.badRequest('Email does not exist');
    }
    await sendVerificationMail({
      email: isExist.email,
      emailType: 'RESET',
      userId: isExist._id,
    });
    return res.status(200).json({ msg: 'have sent you an email' });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.internal('Failed to send email'));
  }
  // if (mailResponse.rejected.length > 0) {
  //   return res.status(500).json({ msg: 'email not sent' });
  // }
};

export const newPasswordController = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const token = req.body.token;

    const isUser = await User.findOne({
      forgotPasswrodToken: token,
      forgotPasswrodTokenExpiry: { $gt: Date.now() },
    });

    if (!isUser) {
      throw ApiError.badRequest('Session expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    isUser.password = hashedPassword;
    isUser.forgotPasswrodTokenExpiry = undefined;
    isUser.forgotPasswrodToken = undefined;

    await isUser.save();
    return res.status(200).json({ msg: 'password updated successfully' });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(ApiError.internal('Failed to update password'));
  }
};

export const getMealsController = async (req, res, next) => {
  try {
    const items = await foodItem.find();
    if (!items) {
      return ApiError.badRequest('No items found');
    }
    return res.status(200).json(items);
  } catch (error) {
    console.log('Error', error);
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(ApiError.internal('Server Error'));
  }
};

export const placeOrderController = async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user.id);
    const user = await User.findById(userId);
    if (!user) {
      // return res.status(400).json({ msg: 'no customer registered yet' });
      throw ApiError.badRequest('No customer registered yet');
    }

    let items = req.body;
    if (!items || items.length === 0) {
      // return res.status(400).json({ msg: 'No food items were selected' });
      throw ApiError.badRequest('No food items were selected');
    }

    items = items.map((item) => {
      return {
        ...item,
        _id: new ObjectId(item._id),
      };
    });
    // const calcTotalPrice = (items) => {
    //   return items.reduce(
    //     (total, item) => total + Number(item.price) * Number(item.quantity),
    //     0
    //   );
    // };
    const totalPrice = calcTotalPrice(items);

    await Order.create({
      user: userId,
      items,
      totalPrice,
    });
    // console.log(newOrder);
    return res.status(201).json({ msg: 'order submitted' });
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(ApiError.internal('Server Error'));
  }
};
