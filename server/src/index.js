const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
require('./db/mongoose');

const errorHandling = require('./middlewares/errorHandling');

// router imports
const userRoutes = require('./router/user');
const PostRoutes = require('./router/post');
const CategoryRoutes = require('./router/category');

const app = express();

app.use(express.json());
app.use(morgan('common'));
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));

app.get('/', (req, res) => {
  res.json({
    message: 'This is Blog REST API',
  });
});

app.use(`/api/${process.env.VERSION}/`, userRoutes);
app.use(`/api/${process.env.VERSION}/`, PostRoutes);
app.use(`/api/${process.env.VERSION}/`, CategoryRoutes);

app.use(errorHandling.notFound);
app.use(errorHandling.errorHandler);

const port = process.env.PORT || 1336;

app.listen(port, () => {
  console.log(`Listenning at http://localhost:${port}`);
});
