// middleware/adminMiddleware.js
import { clerkClient } from "@clerk/express";

// Use after protect. Allows only users with role "admin" in Clerk
export const adminOnly = async (req, res, next) => {
  const user = await clerkClient.users.getUser(req.userId);

  if (user.publicMetadata?.role !== "admin") {
    res.status(403);
    throw new Error("Admin access only");
  }

  next();
};