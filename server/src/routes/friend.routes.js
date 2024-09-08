import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  sendRequest,
  getFriends,
  acceptRequest,
  getRequestedFriend,
  rejectRequest,
  getUsersRequestedByMe,
  unFriend,
} from "../controller/friend.controller.js";

const router = Router();
// console.log("User kdsflkjsdjfkj")

router.route("/getFriends").get(verifyJWT, getFriends);
router.route("/getRequestedFriends").get(verifyJWT, getRequestedFriend);
router.route("/addFriend").post(verifyJWT, sendRequest);
router.route("/acceptRequest").put(verifyJWT, acceptRequest);
router.route("/rejectRequest").delete(verifyJWT, rejectRequest);
router.route("/requestedByMe").get(verifyJWT, getUsersRequestedByMe)
router.route("/unFriend").delete(verifyJWT, unFriend)

export default router;
