const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  title: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// CategorySchema.virtual('posts', {
//   ref: 'Post',
//   localField: '_id',
//   foreignField: 'category',
// });

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
