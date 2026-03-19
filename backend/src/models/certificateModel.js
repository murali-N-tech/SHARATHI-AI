import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    issuer: {
      type: String,
      default: "SARATHI",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    grade: {
      type: String,
      required: true,
    },

    credentialId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["earned", "locked"],
      default: "earned",
    },

    skills: {
      type: [String],
      default: [],
    },

    color: {
      type: String,
      default: "from-blue-500 to-cyan-500",
    },

    // Optional link to a specific custom domain this certificate belongs to
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomDomain",
    },

    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
    },

    completionPercentage: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Certificate", certificateSchema);
