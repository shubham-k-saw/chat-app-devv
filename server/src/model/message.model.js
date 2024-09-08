import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  messageId: {
    type: String,
    required: true,
    index: true,
  },
  deletedByReceiver: {
    type: Boolean,
    required: true,
    default: false
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  seenTime: {
    type: Date,
  },
});

export const Message = mongoose.model("Message", messageSchema);
