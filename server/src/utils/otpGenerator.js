import { authenticator } from "otplib";

export const generateOtp = () => {
  const secret = authenticator.generateSecret();
  const otp = authenticator.generate(secret);
  return { otp, secret };
};

export const verifyOtpUsingSecret = (otpByUser, secret) => {
  const isValid = authenticator.check(otpByUser, secret);
  console.log(isValid)
  return isValid;
};
