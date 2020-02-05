const express = require('express');
const { ObjectID } = require('mongodb');

const router = new express.Router();

const Category = require('../models/category');
const Post = require('../models/post');
const auth = require('../middlewares/auth');

router.post('/category', auth, async (req, res) => {
  const category = new Category({
    ...req.body,
  });
  try {
    await category.save();
    res.status(201).send(category);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/categories', async (req, res) => {
  try {
    const category = await Category.find({});
    res.send(category);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/category/:id', async (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send();
  }
  try {
    const category = await Category.findOne({ _id });
    if (!category) {
      return res.status(404).send();
    }
    res.send(category);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/category/:id', auth, async (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    res.status(404).send();
  }
  try {
    let category = await Category.findOne({ _id: req.params.id });

    if (!category) {
      res.status(404).send();
    }

    category = {
      ...category,
      title: req.body.title,
    };

    await category.save();

    res.send(category);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete('/category/:id', auth, async (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send();
  }
  try {
    const category = await Category.findOneAndDelete({ _id });
    if (!category) {
      return res.status(404).send();
    }
    res.send(category);
  } catch (error) {
    res.status(500).send();
  }
});


// get all the posts related to the category
router.get('/category/:id/posts', async (req, res) => {
  try {
    const post = await Post.find({ categoryId: req.params.id });
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
