import User from '../models/User.js';
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

const sendOrderMail = async ({ email, emailType }) => {
  try {
    //create trasnport for sending mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // const transporter = nodemailer.createTransport({
    //   host: 'sandbox.smtp.mailtrap.io',
    //   port: 2525,
    //   auth: {
    //     user: 'a0afb90f8125bb',
    //     pass: 'ca6823259bcff1',
    //   },
    // });

    const mailResponse = await transporter
      .sendMail({
        from: process.env.EMAIL_ADMIN,
        to: email,
        subject: emailType === 'declined' ? 'Order Declined' : 'Order Approved',
        html: `<p>Your Order has been ${
          emailType === 'declined'
            ? 'declined. So Plz call to customer care to ckeck for more details. Thank you.'
            : 'approved. Plz wait for the rider to get you on call and deliver your order. Thank you.'
        }
        }</p>`,
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json('Email sending Failed...');
      });

    return mailResponse;
  } catch (error) {
    return error.message;
  }
};

export default sendOrderMail;
