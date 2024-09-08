import mongoose from "mongoose";

const friendSchema = mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  requestedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
  },
});

export const Friend = mongoose.model("Friend", friendSchema);
