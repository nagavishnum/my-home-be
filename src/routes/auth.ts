import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { u, p } = req.body;

    if (!u || !p) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    const exists = await User.findOne({ u }).lean();

    if (exists) {
      res.status(400).json({ error: 'User exists' });
      return;
    }

    const hash = await bcrypt.hash(p, 8);

    const user = await User.create({
      u: String(u).trim(),
      p: hash
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    res.status(201).json({ token, username: user.u });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { u, p } = req.body;

    const user = await User.findOne({ u });

    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const ok = await bcrypt.compare(p, user.p);

    if (!ok) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    res.json({ token,username: user.u  });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;