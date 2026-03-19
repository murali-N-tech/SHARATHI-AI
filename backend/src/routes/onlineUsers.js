import express from 'express';
import OnlineUser from '../models/onlineUserModel.js';

const router = express.Router();

// Upsert presence: body { email, name }
router.post('/presence', async (req, res) => {
  try {
    const { email, name } = req.body;
    // console.log('[online-users] presence payload:', req.body);
    if (!email) return res.status(400).json({ error: 'email required' });

    const now = new Date();
    const updated = await OnlineUser.findOneAndUpdate(
      { email },
      { name, online: true, lastSeen: now },
      { upsert: true, new: true }
    );
    res.json({ status: 'ok', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Mark offline
router.post('/away', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    await OnlineUser.findOneAndUpdate({ email }, { online: false, lastSeen: new Date() });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Get online users (optionally filter by recency)
router.get('/', async (req, res) => {
  try {
    // consider users as online if online:true and lastSeen within 60s
    const threshold = new Date(Date.now() - 10 * 60 * 1000);
    const users = await OnlineUser.find({ online: true, lastSeen: { $gte: threshold } }).sort({ lastSeen: -1 });
    res.json({ status: 'ok', users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
