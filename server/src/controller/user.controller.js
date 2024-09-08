import { User } from "../model/user.model.js";
import { sendEmail } from "../service/mail.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOtp } from "../utils/otpGenerator.js";
import { comparePassword, hashPassword } from "../utils/passwordEncryptor.js";
import { Otp } from "../model/otp.model.js";
import jwt from "jsonwebtoken";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
} from "../utils/validator.js";
import { getExpiryTime } from "../utils/getExpiryTime.js";
import { generateAccessAndRefreshToken } from "../service/jwtToken.service.js";
import { RefreshToken } from "../model/refreshToke.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

// register controller
export const register = asyncHandler(async (req, res) => {
  const { userName, email, password, confirmPassword, firstName, lastName } =
    req.body;

  const isEmailValid = emailSchema.safeParse(email);

  if (!isEmailValid.success) {
    return res.status(400).send({
      success: false,
      message: "Invalid email format",
    });
  }

  const isPasswordValid = passwordSchema.safeParse(password);

  if (!isPasswordValid.success) {
    return res.status(400).send({
      success: false,
      message: isPasswordValid.error.errors,
    });
  }

  const isUserNameValid = usernameSchema.safeParse(userName);

  if (!isUserNameValid.success) {
    return res.status(400).send({
      success: false,
      message: isUserNameValid.error.errors,
    });
  }

  if (password != confirmPassword) {
    return res.status(400).send({
      success: false,
      message: "Passwords do not match",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    return res.status(409).send({
      success: false,
      message: "User Already Exist",
    });
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    userName,
    email,
    firstName,
    lastName,
    password: hashedPassword,
  });

  if (!user) {
    return res.status(400).send({
      success: false,
      message: "User not created successfully",
    });
  }

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    return res.status(500).send({
      success: false,
      message: "Something went wrong while registering the user",
    });
  }

  return res.status(201).send({
    success: true,
    message: "User Register successfully",
    data: createdUser,
  });
});

// login
export const login = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  console.log(userName);
  if (!userName && !email) {
    return res.status(400).send({
      success: false,
      message: "Email or Username is required",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!existingUser) {
    return res.status(404).send({
      success: false,
      message: "User Not Found",
    });
  }

  const isPasswordMatched = await comparePassword(
    password,
    existingUser.password
  );

  if (!isPasswordMatched) {
    return res.status(401).send({
      success: false,
      message: "Password Doesn't Matched",
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id
  );

  const expiryTime = getExpiryTime(process.env.REFRESH_TOKEN_EXPIRY);

  const refreshTokenObj = await RefreshToken.create({
    userId: existingUser._id,
    token: refreshToken,
    expiresAt: expiryTime,
  });

  if (!refreshTokenObj) {
    return res.status(500).send({
      success: false,
      message: "Refresh Token Doesn't Stored in Database",
    });
  }

  const cookieOptions = {
    httpOnly: true,
    secure: false, // For development, set to true in production
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .send({
      success: true,
      message: "User LoggedIn Successfully",
      date: {
        userName: existingUser.userName,
        email: existingUser.email,
      },
    });
});

// logout user
export const logout = asyncHandler(async (req, res) => {
  const user = req.user;
  const refreshToken = req.refreshToken;

  if (!refreshToken) {
    return res.status(401).send({
      success: false,
      message: "Invalid Refresh Token",
    });
  }

  await RefreshToken.deleteOne({ userId: user._id, token: refreshToken });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .send({
      success: true,
      message: "User LoggedOut Successfully",
      date: {
        userName: user.userName,
        email: user.email,
      },
    });
});

// send otp controller
export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).send({
      success: false,
      message: "User Already Exist",
    });
  }

  const isEmailValid = emailSchema.safeParse(email);

  if (!isEmailValid.success) {
    return res.status(400).send({
      success: false,
      message: "Invalid email format",
    });
  }

  const { otp, secret } = generateOtp();

  if (!otp) {
    return res.status(500).send({
      success: false,
      message: "Getting error while generating otp",
    });
  }

  var isOtpSendToEmail;
  try {
    // console.log("dfjjk")
    isOtpSendToEmail = await sendEmail(email, false, otp);
    console.log("Dewansh Shaw");
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Invalid email address. or Failed to send email",
    });
  }

  console.log(isOtpSendToEmail);

  if (!isOtpSendToEmail) {
    return res.status(500).send({
      success: false,
      message: "Getting error while sending otp verification mail",
    });
  }

  const storedOtp = await Otp.findOne({ email });
  const expiryTime = getExpiryTime(process.env.OTP_EXPIRY);

  if (storedOtp) {
    const otpObj = await Otp.findOneAndUpdate(
      { email },
      {
        otp,
        secret,
        expiresAt: expiryTime,
      },
      {
        new: true,
      }
    );

    if (!otpObj) {
      return res
        .status(400)
        .send({ success: false, message: "Otp Not Updated Successfully" });
    }
  } else {
    const newOtpObj = await Otp.create({
      email,
      otp,
      secret,
      expiresAt: expiryTime,
    });

    if (!newOtpObj) {
      return res.status(400).send({
        success: false,
        message: "New Otp not Created",
      });
    }
  }

  return res.status(200).send({
    success: true,
    message: "Otp send successfully",
  });
});

// verity otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const isEmailValid = emailSchema.safeParse(email);

  if (!isEmailValid.success) {
    return res.status(400).send({
      success: false,
      message: "Invalid email format",
    });
  }

  const generatedOtp = await Otp.findOne({ email });
  if (!generatedOtp) {
    return res.status(401).send({
      success: false,
      message: "Otp has expired",
    });
  }

  console.log(generatedOtp.expiresAt + " " + Date.now());

  if (generatedOtp.expiresAt < new Date()) {
    await Otp.findOneAndDelete({ email });
    return res.status(401).send({
      success: false,
      message: "Otp has expired",
    });
  }

  const isOtpVerified =
    parseInt(generatedOtp.otp) == parseInt(otp) ? true : false;

  if (!isOtpVerified) {
    return res.status(400).send({
      success: false,
      message: "Invalid OTP",
    });
  } else {
    await Otp.findOneAndDelete({ email });
    await sendEmail(email, true);
    return res.status(200).send({
      success: true,
      message: "OTP Verified Successfully",
    });
  }
});

// Generate Access Token using Refresh Token
export const generateAccessTokenUsingRefreshToken = asyncHandler(
  async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || null;
   
    if (!incomingRefreshToken) {
      return res.status(403).send({
        success: false,
        message: "Refresh Token Has Been Expired",
      });
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized user",
      });
    }

    const restoredRefreshToken = await RefreshToken.findOne({
      userId: decodedToken.userId,
      token: incomingRefreshToken,
    });

    if (!restoredRefreshToken) {
      return res.status(403).send({
        success: false,
        message: "Refresh Token Has Been Expired",
      });
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      restoredRefreshToken.userId
    );

    // console.log("refresh ", refreshToken, "access", accessToken)
    const expiryTime = getExpiryTime(process.env.REFRESH_TOKEN_EXPIRY);

    const updatedRefreshToken = await RefreshToken.findOneAndUpdate(
      {
        userId: restoredRefreshToken.userId,
        token: restoredRefreshToken.token,
      },
      { token: refreshToken, expiresAt: expiryTime },
      { new: true }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .send({
        success: true,
        message: "Access token generated successfully",
        data: updatedRefreshToken,
      });
  }
);

// get current user
export const getUser = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).send({
    success: true,
    data: user,
  });
});

// get all user details

export const getAllUser = asyncHandler(async (req, res) => {
  const user = req.user;

  const users = await User.find({ userName: { $ne: user.userName } }).limit(10);
  if (!users) {
    return res.status(400).send({
      success: false,
      message: "Getting error while fetching the users detail",
    });
  }

  return res.status(200).send({
    success: true,
    data: users,
    message: "Users Details fetched successfully",
  });
});

// upload profile picture
export const uploadProfilePic = asyncHandler(async (req, res) => {
  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    return res.status(401).res({
      message: "File is not uploaded to the local machine",
    });
  }

  if (req.user.profilePicture) {
    const deletedResponse = await deleteFromCloudinary(req.user.profilePicture);

    if (!deletedResponse) {
      return res.status(401).send({
        message: "Getting Error while deletion from cloudinary",
      });
    }
  }

  const profilePic = await uploadOnCloudinary(profileLocalPath);
  if (!profilePic) {
    return res.status(401).send({
      message: "Getting the error while uploading the profile pic",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      profilePicture: profilePic.url,
    },
    {
      new: true,
    }
  ).select("-password");

  if (!updatedUser) {
    res.status(404).send({
      message: "User not found",
    });
  }

  res.status(200).send({
    message: "Profile Pic Uploaded Successfully",
    profilePicture: updatedUser.profilePicture,
  });
});

// delete profile pic

export const removeProfilePic = asyncHandler(async (req, res) => {
  const user = req.user;

  const profilePicUrl = user.profilePicture;

  if (!profilePicUrl) {
    return res.status(401).send({
      message: "Profile Url is not valid",
    });
  }

  const deletedResponse = await deleteFromCloudinary(user.profilePicture);

  if (!deletedResponse) {
    return res.status(401).send({
      message: "Getting Error while deletion from cloudinary",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { profilePicture: "" }, // Remove the profilePicture field
    },
    {
      new: true,
    }
  ).select("-password"); // Exclude the password field

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).send({
    message: "Successfully deleted from cloudinary",
    profilePicture: "",
  });
});

// change the password
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  const isPasswordValid = passwordSchema.safeParse(newPassword);
  if (!isPasswordValid.success) {
    return res.status(400).send({
      success: false,
      message: isPasswordValid.error.errors[1].message,
    });
  }

  if (newPassword != confirmNewPassword) {
    return res.status(401).send({
      success: false,
      message: "Password doesn't matched",
    });
  }
  const isPasswordMatched = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isPasswordMatched) {
    return res.status(401).send({
      success: false,
      message: "Wrong Password",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(401).send({
      success: false,
      message: "Old password and New password is same",
    });
  }

  // console.log(user.password)

  const hashedPassword = await hashPassword(newPassword);

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      password: hashedPassword,
    },
    {
      new: true,
    }
  ).select("-password");

  if (!updatedUser) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  return res.status(200).send({
    message: "Password changes successfully",
    data: updatedUser,
  });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const user = req.user;
  if (!query) {
    const users = await User.find({ userName: { $ne: user.userName } }).limit(
      10
    );
    return res.status(200).send({ success: true, data: users });
  }

  const users = await User.find({
    userName: { $regex: query, $options: "i" },
    _id: { $ne: user._id }, // Case-insensitive search
  });

  return res.status(200).send({ success: true, data: users });
});
