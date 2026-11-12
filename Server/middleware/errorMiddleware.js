// errorMiddleware.js

// 1. Runs when no route matches the request
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// 2. Runs when any error happens in the app
export const errorHandler = (err, req, res, next) => {
  // if status is still 200, an error happened, so use 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};