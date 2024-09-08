import mongoose from "mongoose";

const otpSchema = mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
    },
    secret: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Otp = mongoose.model("Otp", otpSchema);
