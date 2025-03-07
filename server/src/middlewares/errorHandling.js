const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404); // not found
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: error,
    stack: process.env.NODE_EVN === 'production' ? '☠️' : error.stack,
  });
};


module.exports = {
  notFound,
  errorHandler,
};
