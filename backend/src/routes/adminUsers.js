const express = require('express');
const userRepository = require('../repositories/userRepository');
const { createUserService } = require('../services/userService');

const router = express.Router();
const userService = createUserService(userRepository);

function handleError(res, err) {
  res.status(err.status ?? 500).json({ error: err.message });
}

router.get('/', async (req, res) => {
  try {
    const users = await userService.listAll({ status: req.query.status });
    res.json(users);
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await userService.create(req.body ?? {});
    res.status(201).json(user);
  } catch (err) {
    handleError(res, err);
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const user = await userService.update(Number(req.params.id), req.body ?? {});
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/:id/deactivate', async (req, res) => {
  try {
    const user = await userService.deactivate(Number(req.params.id));
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/:id/reactivate', async (req, res) => {
  try {
    const user = await userService.reactivate(Number(req.params.id));
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
