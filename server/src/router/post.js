const express = require('express');
const { ObjectID } = require('mongodb');

const router = new express.Router();

const Post = require('../models/post');
const auth = require('../middlewares/auth');

router.post('/posts', auth, async (req, res) => {
  const post = new Post({
    ...req.body,
    author: req.user._id,
  });
  try {
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find({});
    res.send(posts);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/posts/:id', async (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send();
  }
  try {
    const post = await Post.findOne({ _id });
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/posts/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'title'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates' });
  }
  if (!ObjectID.isValid(_id)) {
    res.status(404).send();
  }
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });

    if (!post) {
      res.status(404).send();
    }

    updates.forEach((update) => {
      post[update] = req.body[update];
    });
    await post.save();

    res.send(post);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete('/posts/:id', auth, async (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send();
  }
  try {
    const deletepost = await Post.findOneAndDelete({ _id, author: req.user._id });
    if (!deletepost) {
      return res.status(404).send();
    }
    res.send(deletepost);
  } catch (error) {
    res.status(500).send();
  }
});

// like
router.post('/posts/:id/like', auth, async (req, res) => {
  const userId = req.user._id;

  if (!ObjectID.isValid(userId)) {
    return res.status(404).send();
  }

  const post = await Post.findOne({ _id: req.params.id });
  const hasLikedUser = post.likes.find((user) => user._id === userId);

  if (hasLikedUser) {
    post.likes.splice(hasLikedUser, 1);
  } else {
    post.likes.push({
      _id: userId,
      usernmae: req.user.username,
    });
  }

  try {
    await post.save();
    res.status(201).send(post.likes);
  } catch (error) {
    res.status(400).send(error);
  }
});

// comments
router.post('/posts/:id/comment', auth, async (req, res) => {
  const _id = req.params.id;
  const userid = req.user._id;

  if (!ObjectID.isValid(_id) || !ObjectID.isValid(userid)) {
    return res.status(404).send();
  }

  const comment = new Comment({
    ...req.body,
    author: userid,
    postId: _id,
  });

  try {
    await comment.save();
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// get all the comments related to the post
router.get('/posts/:id/comment', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    await post.populate('comments').execPopulate();
    res.send(post.comments);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
