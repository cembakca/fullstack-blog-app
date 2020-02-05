const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category',
  },
  likes: {
    type: Array,
    default: [],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  puslishDate: {
    type: Date,
  },
});

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
});


const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
