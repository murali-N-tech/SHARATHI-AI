import mongoose from "mongoose";
import providerSchema from "./authProviderModel.js";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String, // only for local auth
    },

    avatar: {
      type: String,
    },

    providers: {
      type: [providerSchema],
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);