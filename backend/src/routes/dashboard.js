const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

router.get('/metrics', async (req, res) => {
  const userId = req.userId ?? DEFAULT_USER_ID;
  try {
    const [peopleAdded, cardsDue, totalQuizAnswers, correctQuizAnswers] = await Promise.all([
      prisma.contact.count({ where: { userId } }),
      prisma.reviewCard.count({ where: { contact: { userId }, nextReviewAt: { lte: new Date() } } }),
      prisma.quizResult.count({ where: { contact: { userId } } }),
      prisma.quizResult.count({ where: { contact: { userId }, quality: { gte: 3 } } }),
    ]);

    const accuracyPercentage = totalQuizAnswers === 0
      ? null
      : Math.round((100 * correctQuizAnswers) / totalQuizAnswers);

    res.json({ peopleAdded, cardsDue, totalQuizAnswers, accuracyPercentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
