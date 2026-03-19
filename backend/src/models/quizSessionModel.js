import mongoose from 'mongoose';

const quizSessionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      index: true,
    },
    domainId: {
      type: String,
      index: true,
    },
    testKey: {
      type: String,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    payload: {
      type: Object,
      required: true,
    },
    // Optional analyzed insights payload from model statistics API
    analysis: {
      type: Object,
      default: null,
    },
    // Computed fields for quick filtering/analytics
    scorePercent: {
      type: Number,
      default: null,
    },
    passed: {
      type: Boolean,
      default: false,
      index: true,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Session', quizSessionSchema);
