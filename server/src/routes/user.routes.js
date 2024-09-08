import { Router } from "express";
import {
  changePassword,
  generateAccessTokenUsingRefreshToken,
  getAllUser,
  getUser,
  login,
  logout,
  register,
  removeProfilePic,
  searchUsers,
  sendOtp,
  uploadProfilePic,
  verifyOtp,
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { getMessages } from "../controller/message.controller.js";

const router = Router();

router.route("/register").post(register);
router.route("/sendOtp").post(sendOtp);
router.route("/verifyOtp").post(verifyOtp);
router.route("/login").post(login);
router.route("/logout").delete(verifyJWT, logout);
router
  .route("/regenerateAccessToken")
  .post(generateAccessTokenUsingRefreshToken);
router.route("/getUser").get(verifyJWT, getUser);
router.route("/getUsers").get(verifyJWT, getAllUser);
router
  .route("/uploadProfilePic")
  .patch(upload.single("profilePic"), verifyJWT, uploadProfilePic);
router.route("/deleteProfilePic").delete(verifyJWT, removeProfilePic);
router.route("/changePassword").post(verifyJWT, changePassword);
router.route("/logout").post(verifyJWT, logout);
router.route("/search").get(verifyJWT, searchUsers)
export default router;
