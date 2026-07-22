const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = status >= 500 ? 'Internal server error.' : err.message;
  if (status >= 500) console.error('Unhandled error:', err);

  res.status(status).json({
    error: {
      code: err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message,
    },
  });
};

module.exports = errorHandler;
