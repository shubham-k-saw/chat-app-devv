import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken || null;

  if (!accessToken) {
    return res.status(401).send({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken.userId).select("-password");

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Invalid Access Token",
      });
    }

    req.refreshToken = req.cookies?.refreshToken || null;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token has expired" });
    } else {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  }
});
