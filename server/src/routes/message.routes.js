import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteMessage, getMessages } from "../controller/message.controller.js";

const router = Router();

router.route("/getMessages").get(verifyJWT, getMessages);
router.route("/deleteMessage").delete(verifyJWT, deleteMessage)

export default router;
