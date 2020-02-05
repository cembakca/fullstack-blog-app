const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Post = require('./post');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  surname: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number');
      }
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid!');
      }
    },

  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error('Please enter your password!');
      } else if (validator.equals(value.toLowerCase(), 'password')) {
        throw new Error('Password is invalid!');
      } else if (validator.contains(value.toLowerCase(), 'password')) {
        throw new Error('Password should not contain password!');
      }
    },
  },
  likes: {
    type: Array,
    default: [],
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
});

UserSchema.statics.checkValidCredentials = async (email, password) => {
  // eslint-disable-next-line no-use-before-define
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login 2');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login 2');
  }
  return user;
};

UserSchema.methods.newAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

UserSchema.pre('remove', async function (next) {
  const user = this;
  await Post.deleteMany({ author: user._id });
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
