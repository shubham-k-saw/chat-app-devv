import { app } from "../../app.js";
import http from "http";
import { Server } from "socket.io";
import { Message } from "../model/message.model.js";
import { sendRequest } from "../controller/friend.controller.js";
import { logMessageToKafka } from "../db/kafkaProducer.js";
import { publishMessage } from "../db/redis.js";

const USING_KAFKA = process.env.USING_KAFKA

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});

// Store connected users with their socket IDs
const users = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user registration
  socket.on("register", (username) => {
    users[username] = socket.id;
    io.emit("user_online", Object.keys(users));
    console.log("User registered:", username);
  });

  // Handle private messages
  socket.on(
    "private_message",
    async ({
      sender,
      receiver,
      messageId,
      message,
      timestamp,
      senderId,
      receiverId,
    }) => {
      // const receiverSocketId = users[receiver];

      // publishing message to redis channel
      const msg = JSON.stringify({
        sender,
        receiver,
        messageId,
        message,
        timestamp,
        senderId,
        receiverId,
      })

      publishMessage(msg)

      // if (receiverSocketId) {
      //   console.log("Send the message")
      //   io.to(receiverSocketId).emit("private_message", {
      //     receiverId,
      //     senderId,
      //     message,
      //     messageId,
      //     timestamp,
      //   });
      // } else {
      //   console.log(`Receiver ${receiver} not online`);
      // }

      if (USING_KAFKA === 'true') {
        console.log('Step 1: USING_KAFKA and log message to kafka')
        logMessageToKafka(
          senderId,
          receiverId,
          messageId,
          message,
          timestamp,
        )
      } else {
        const newMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          messageId,
          message,
          timestamp,
        });
        await newMessage.save();
      }

      // const newMessage = new Message({
      //   sender: senderId,
      //   receiver: receiverId,
      //   messageId,
      //   message,
      //   timestamp,
      // });
      // await newMessage.save();
    }
  );

  // Handle typing status
  socket.on("typing", ({ sender, recipient }) => {
    const recipientSocketId = users[recipient];
    if (recipientSocketId) {

      io.to(recipientSocketId).emit("typing", { sender });
    }
  });

  socket.on("stop_typing", ({ sender, recipient }) => {
    const recipientSocketId = users[recipient];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("stop_typing", { sender });
    }
  });

  // Handle user going offline
  socket.on("user_offline", (username) => {
    if (users[username]) {
      delete users[username];
      io.emit("user_offline", username);
      console.log("User offline:", username);
    }
  });

  socket.on("call-user", ({ from, to, signal }) => {
    if (users[to]) {
      io.to(users[to]).emit("call-made", { signal, from });
    }
  });

  // Handle call acceptance
  socket.on("accept-call", ({ signal, to }) => {
    io.to(users[to]).emit("call-accepted", signal);
  });

  // Handle call rejection
  socket.on("reject-call", ({ to }) => {
    io.to(users[to]).emit("call-rejected");
  });

  // Handle call end
  socket.on("end-call", ({ from, to }) => {
    if (users[to]) {
      io.to(users[to]).emit("call-ended", { from });
    }
    if (users[from]) {
      io.to(users[from]).emit("call-ended", { from: to });
    }
  });

  socket.on("accept-request", async ({ requestedBy, friend }) => {
    io.to(users[requestedBy]).emit("accept-request", { friend });
  });

  socket.on("reject-request", async ({ requestedBy, requestedTo }) => {
    console.log(requestedBy, requestedTo);
    io.to(users[requestedBy]).emit("reject-request", { requestedTo });
  });

  socket.on("send-request", async ({ requestedTo, request }) => {
    io.to(users[requestedTo]).emit("send-request", { request });
  });

  socket.on("unsend-request", async ({ requestedTo, requestedBy }) => {
    console.log(requestedBy, requestedTo);
    io.to(users[requestedTo]).emit("unsend-request", { requestedBy });
  });

  socket.on("unfriend-request", async ({ from, to }) => {
    io.to(users[to]).emit("unfriend-request", { from });
  });

  socket.on("delete-message", ({ from, to, messageId }) => {
    console.log(from, to)
    io.to(users[to]).emit("delete-message", { from, messageId });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    for (const [username, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[username];
        io.emit("user_offline", username);
        console.log("User disconnected:", username);
        break;
      }
    }
  });
});

export { server, io, users };
