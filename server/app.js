import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));

// agar hum data json formate me lete h to limit kya honi chahiye
app.use(express.json({ limit: "16kb" }));

// agar data url  se le rahe h to wo encoded ho kar ata h
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// agar koi file upload karte h to ise use karte h
app.use(express.static("public"));

app.use(cookieParser());

// routers

import userRouter from "./src/routes/user.routes.js";
import friendRouter from "./src/routes/friend.routes.js";
import messageRouter from "./src/routes/message.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/friend", friendRouter);
app.use("/api/v1/message", messageRouter);
export { app };
