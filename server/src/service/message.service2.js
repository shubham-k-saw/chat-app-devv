import { app } from "../../app.js";
import http from "http";
import { Server } from "socket.io";
import { Message } from "../model/message.model.js";
import { sendRequest } from "../controller/friend.controller.js";
import { getSocketId, removeSocketId, setSocketId } from "../db/redis.js";

const USING_REDIS = process.env.USING_REDIS

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
    if (USING_REDIS === 'true') {
      setSocketId(username, socket.id)
      // without redis code is sending all user's username and socketid who are connected to the server
      // this is not possible to implement in a scalable system as there may be thousands of user
      // we'll need to find different way 
      // let's see later
      const onlineUser = {
        username: socket.id
      }
      io.emit("user_online", onlineUser)
    } else {
      users[username] = socket.id;
      io.emit("user_online", Object.keys(users));
      console.log("User registered:", username);
    }
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
      if (USING_REDIS === 'true') {
        const receiverSocketId = getSocketId(receiver)
      } else {
        const receiverSocketId = users[receiver];
      }

      if (receiverSocketId) {
        console.log("Send the message")
        io.to(receiverSocketId).emit("private_message", {
          receiverId,
          senderId,
          message,
          messageId,
          timestamp,
        });
      } else {
        console.log(`Receiver ${receiver} not online`);
      }

      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        messageId,
        message,
        timestamp,
      });
      await newMessage.save();
    }
  );

  // Handle typing status
  socket.on("typing", ({ sender, recipient }) => {

    if (USING_REDIS === 'true') {
      const recipientSocketId = getSocketId(recipient)
    } else {
      const recipientSocketId = users[recipient];
    }

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing", { sender });
    }
  });

  socket.on("stop_typing", ({ sender, recipient }) => {

    if (USING_REDIS === 'true') {
      const recipientSocketId = getSocketId(recipient)
    } else {
      const recipientSocketId = users[recipient];
    }

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("stop_typing", { sender });
    }
  });

  // Handle user going offline
  // do it later, as not sure how we can implement this on redis
  // i guess this happening when user disconnect, we can use there
  // let's see later
  socket.on("user_offline", (username) => {
    if (users[username]) {
      delete users[username];
      io.emit("user_offline", username);
      console.log("User offline:", username);
    }
  });

  socket.on("call-user", ({ from, to, signal }) => {
    if (USING_REDIS === 'true') {
      const userTo = getSocketId(to)
      if (userTo) {
        io.to(userTo).emit("call-made", { signal, from })
      }
    } else {
      if (users[to]) {
        io.to(users[to]).emit("call-made", { signal, from });
      }
    }
  });

  // Handle call acceptance
  socket.on("accept-call", ({ signal, to }) => {
    if (USING_REDIS === 'true') {
      const userTo = getSocketId(to)
      io.to(userTo).emit("call-accepted", signal)
    } else {
      io.to(users[to]).emit("call-accepted", signal);
    }
  });

  // Handle call rejection
  socket.on("reject-call", ({ to }) => {
    if (USING_REDIS === 'true') {
      const userTo = getSocketId(to)
      io.to(userTo).emit("call-rejected");
    } else {
      io.to(users[to]).emit("call-rejected");
    }
  });

  // Handle call end
  socket.on("end-call", ({ from, to }) => {

    if (USING_REDIS === 'true') {
      const userTo = getSocketId(to)
      const userFrom = getSocketId(from)
      if (userTo) {
        io.to(userTo).emit("call-ended", { from });
      }
      if (userFrom) {
        io.to(userFrom).emit("call-ended", { from: to });
      }
    } else {
      if (users[to]) {
        io.to(users[to]).emit("call-ended", { from });
      }
      if (users[from]) {
        io.to(users[from]).emit("call-ended", { from: to });
      }
    }
  });

  socket.on("accept-request", async ({ requestedBy, friend }) => {
    if (USING_REDIS === 'true') {
      const reqBy = getSocketId(requestedBy)
      io.to(reqBy).emit("call-accepted", signal)
    } else {
      io.to(users[requestedBy]).emit("accept-request", { friend });
    }
  });

  socket.on("reject-request", async ({ requestedBy, requestedTo }) => {
    if (USING_REDIS === 'true') {
      const reqBy = getSocketId(requestedBy)
      const reqTo = getSocketId(requestedTo)
      console.log(requestedBy, requestedTo);
      io.to(reqBy).emit("reject-request", { reqTo });
    } else {
      console.log(requestedBy, requestedTo);
      io.to(users[requestedBy]).emit("reject-request", { requestedTo });
    }
  });

  socket.on("send-request", async ({ requestedTo, request }) => {
    if (USING_REDIS === 'true') {
      const reqTo = getSocketId(requestedTo)
      io.to(reqTo).emit("send-request", { request });
    } else {
      io.to(users[requestedTo]).emit("send-request", { request });
    }
  });

  socket.on("unsend-request", async ({ requestedTo, requestedBy }) => {
    if (USING_REDIS === 'true') {
      const reqBy = getSocketId(requestedBy)
      const reqTo = getSocketId(requestedTo)
      console.log(requestedBy, requestedTo);
      io.to(reqTo).emit("unsend-request", { reqBy });
    } else {
      console.log(requestedBy, requestedTo);
      io.to(users[requestedTo]).emit("unsend-request", { requestedBy });
    }
  });

  socket.on("unfriend-request", async ({ from, to }) => {
    if (USING_REDIS === 'true') {
      const userTo = getSocketId(to)
      io.to(userTo).emit("unfriend-request", { from });
    } else {
      io.to(users[to]).emit("unfriend-request", { from });
    }
  });

  socket.on("delete-message", ({ from, to, messageId }) => {
    if (USING_REDIS === 'true') {
      const userTo = getSocketId(to)
      console.log(from, to)
      io.to(userTo).emit("delete-message", { from, messageId });
    } else {
      console.log(from, to)
      io.to(users[to]).emit("delete-message", { from, messageId });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {

    if (USING_REDIS === 'true') {
      // we'll need to store each server's socket connection in object or map
      // we only should check other server's connection through redis
      // let's see later
      console.log("User disconnected:", socket.id);
    } else {
      for (const [username, id] of Object.entries(users)) {
        // this is not efficient to iterate over all connected user => O(n)
        // we need to find a different way
        // let's see later
        if (id === socket.id) {
          delete users[username];
          io.emit("user_offline", username);
          console.log("User disconnected:", username);
          break;
        }
      }
    }

    // for (const [username, id] of Object.entries(users)) {
    //   if (id === socket.id) {
    //     delete users[username];
    //     io.emit("user_offline", username);
    //     console.log("User disconnected:", username);
    //     break;
    //   }
    // }

  });
});

export { server };
