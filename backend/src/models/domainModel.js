import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    bg: {
      type: String,
      required: true,
    },
    programs: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Domain', domainSchema);
