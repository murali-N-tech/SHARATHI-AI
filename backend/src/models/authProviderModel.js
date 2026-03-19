import mongoose from "mongoose";
const providerSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["google", "github", "local"],
      required: true,
    },

    providerId: {
      type: String, // google.sub / github.id
    },
  },
  { _id: false }
);

export default providerSchema;