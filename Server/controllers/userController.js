import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

// GET /api/users/me  (creates the user if the webhook has not done it yet)
export const getMe = async (req, res) => {
  let user = await User.findOne({ clerkId: req.userId });

  if (!user) {
    const c = await clerkClient.users.getUser(req.userId);
    user = await User.create({
      clerkId: c.id,
      name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
      email: c.emailAddresses[0]?.emailAddress,
      image: c.imageUrl,
      role: c.publicMetadata?.role === "admin" ? "admin" : "user",
    });
  }

  res.json({ success: true, user });
};

// PUT /api/users/me
export const updateMe = async (req, res) => {
  const { name, phone, address } = req.body;

  const user = await User.findOneAndUpdate(
    { clerkId: req.userId },
    { name, phone, address },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, user });
};