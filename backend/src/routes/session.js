const express = require('express');
const userRepository = require('../repositories/userRepository');
const { SESSION_COOKIE_NAME } = require('../middleware/session');

const router = express.Router();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  signed: true,
};

router.post('/', async (req, res) => {
  try {
    const userId = Number(req.body?.userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.active) {
      return res.status(403).json({ error: 'This account has been deactivated' });
    }

    const options = req.body?.rememberMe
      ? { ...COOKIE_OPTIONS, maxAge: THIRTY_DAYS_MS }
      : COOKIE_OPTIONS;
    res.cookie(SESSION_COOKIE_NAME, String(user.id), options);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const cookieValue = req.signedCookies?.[SESSION_COOKIE_NAME];
    if (!cookieValue) {
      return res.status(401).json({ error: 'No active session' });
    }

    const user = await userRepository.findById(Number(cookieValue));
    if (!user || !user.active) {
      return res.status(401).json({ error: 'No active session' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { httpOnly: true, sameSite: 'lax' });
  res.status(204).end();
});

module.exports = router;
