const express = require('express');
const palaceRepository = require('../repositories/palaceRepository');
const { createPalaceService } = require('../services/palaceService');

const router = express.Router();
const DEFAULT_USER_ID = 1;
const palaceService = createPalaceService(palaceRepository);

function handleError(res, err) {
  res.status(err.status ?? 500).json({ error: err.message });
}

router.get('/', async (req, res) => {
  try {
    const palaces = await palaceService.listForUser(req.userId ?? DEFAULT_USER_ID);
    res.json(palaces);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
