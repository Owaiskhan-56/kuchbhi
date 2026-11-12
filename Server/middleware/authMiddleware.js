// middleware/authMiddleware.js
import { getAuth } from "@clerk/express";

// Allows only signed-in users
export const protect = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401);
    throw new Error("Please sign in first");
  }

  req.userId = userId; // controllers will use this
  next();
};