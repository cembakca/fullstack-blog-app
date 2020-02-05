const express = require('express');
const { ObjectID } = require('mongodb');

const router = new express.Router();

const User = require('../models/user');
const auth = require('../middlewares/auth');

router.post('/users/register', async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.newAuthToken();
    res.status(201).json({
      username: user.name,
      _id: user._id,
      email: user.email,
      age: user.age,
      token,
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.checkValidCredentials(req.body.email, req.body.password);
    const token = await user.newAuthToken();
    res.status(201).json({
      username: user.name,
      _id: user._id,
      email: user.email,
      age: user.age,
      token,
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  const { _id } = req.user;

  if (!isValidOperation) {
    res.status(400).json({
      message: 'Invalid request',
    });
  }

  if (!ObjectID.isValid(_id)) {
    return res.status(404).json({
      message: 'Id not found',
    });
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.json({ user: req.user });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
});

router.delete('/users/me', auth, async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  if (!ObjectID.isValid(req.user._id)) {
    return res.status(404).json({
      message: 'Id not found',
    });
  }

  try {
    await req.user.remove();
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});


router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});


module.exports = router;
