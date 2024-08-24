import User from '../models/User.js';
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';

const sendVerificationMail = async ({ email, emailType, userId }) => {
  try {
    console.log(userId);
    //create a hashed token to be sent
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);
    console.log(hashedToken);
    //find the user and update it

    if (emailType === 'VERIFY') {
      console.log('started verification');
      //set date to one hour by adding milliseconds prseent in one hour to date.now()
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    } else {
      if (emailType === 'RESET') {
        await User.findByIdAndUpdate(userId, {
          forgotPasswrodToken: hashedToken,
          forgotPasswrodTokenExpiry: Date.now() + 3600000,
        });
      }
    }
    //create trasnport for sending mail
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'a0afb90f8125bb',
        pass: 'ca6823259bcff1',
      },
    });

    const mailResponse = await transporter
      .sendMail({
        from: 'mehmoodjutt33@gmail.com',
        to: email,
        subject:
          emailType && emailType === 'VERIFY'
            ? 'Verify your email'
            : 'Reset you password',
        html: `<p>Please click <a href = "${process.env.FRONTEND_DOMAIN}/user/${
          emailType === 'VERIFY' ? 'verifyemail' : 'new-password'
        }?token=${hashedToken}">here</a> ${
          emailType === 'VERIFY'
            ? 'to verify your email'
            : 'to reset your password'
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

export default sendVerificationMail;
