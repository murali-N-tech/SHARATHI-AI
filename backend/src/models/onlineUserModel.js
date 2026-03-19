import mongoose from 'mongoose';

const OnlineUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  online: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now }
});

const OnlineUser = mongoose.model('OnlineUser', OnlineUserSchema);
export default OnlineUser;
