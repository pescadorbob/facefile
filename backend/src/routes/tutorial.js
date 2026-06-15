const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

router.get('/progress', async (req, res) => {
  try {
    let progress = await prisma.tutorialProgress.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });
    if (!progress) {
      progress = await prisma.tutorialProgress.create({
        data: { userId: DEFAULT_USER_ID, currentStep: 1, completed: false },
      });
    }
    res.json({ currentStep: progress.currentStep, completed: progress.completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/progress', async (req, res) => {
  const { currentStep, completed } = req.body;
  try {
    const progress = await prisma.tutorialProgress.upsert({
      where: { userId: DEFAULT_USER_ID },
      update: {
        ...(currentStep !== undefined && { currentStep }),
        ...(completed !== undefined && { completed }),
      },
      create: { userId: DEFAULT_USER_ID, currentStep: currentStep ?? 1, completed: completed ?? false },
    });
    res.json({ currentStep: progress.currentStep, completed: progress.completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
