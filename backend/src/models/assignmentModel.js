import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  difficulty: String,
  estimated_time_minutes: Number,
  // allow extra fields
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  assignment_name: { type: String, required: true },
  description: { type: String, default: '' },
  topics: { type: [topicSchema], default: [] },
  total_questions: { type: Number, default: 0 },
  difficulty_level: { type: String, default: '' },
  test_key: { type: String, required: true, unique: true, index: true },
  user_prompt: { type: String, default: '' },
  raw_payload: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
