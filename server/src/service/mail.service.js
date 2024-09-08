import dotenv from "dotenv"
import nodemailer from "nodemailer";
import {
  emailVerifyTemplate,
  successfullyVerifyEmailTemplate,
} from "../utils/emailTemplet.js";

dotenv.config()
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST,
    pass: process.env.PASSWORD,
  },
});

export const sendEmail = async (to, isVerified, text) => {
  var mailOptions;
  try {
    if (!isVerified) {
      mailOptions = {
        from: process.env.HOST,
        to: to, // List of recipients
        subject: "Please Verify Your Email",
        html: emailVerifyTemplate(text),
      };
    } else {
      mailOptions = {
        from: process.env.HOST, // Sender address
        to: to, // List of recipients
        subject: "Email Verified Successfuly", // Subject line
        html: successfullyVerifyEmailTemplate(), // Plain text body
      };
    }

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Getting Error while sending email: " + error);
  }
};
