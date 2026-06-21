const express = require('express');
const { PrismaClient } = require('@prisma/client');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

router.post('/', upload.single('photo'), async (req, res) => {
  const { name, palaceId, locusId, nameImage, associationScene, notes } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        userId: DEFAULT_USER_ID,
        name: name.trim(),
        notes: notes || null,
        photoPath: req.file ? `/uploads/${req.file.filename}` : null,
        palaceId: palaceId ? Number(palaceId) : null,
        locusId: locusId ? Number(locusId) : null,
        nameImage: nameImage || null,
        associationScene: associationScene || null,
        reviewCard: { create: {} },
      },
      include: { reviewCard: true },
    });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await prisma.quizResult.deleteMany({ where: { contact: { userId: DEFAULT_USER_ID } } });
    await prisma.reviewCard.deleteMany({ where: { contact: { userId: DEFAULT_USER_ID } } });
    await prisma.contact.deleteMany({ where: { userId: DEFAULT_USER_ID } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
