const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

router.get('/', async (req, res) => {
  try {
    const palaces = await prisma.palace.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { id: 'asc' },
      include: {
        loci: { orderBy: { position: 'asc' } },
      },
    });
    res.json(palaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
