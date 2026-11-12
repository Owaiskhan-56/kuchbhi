// userController.js
import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

// Forwards async errors to errorHandler (needed on Express 4, harmless on Express 5)
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/users/me (creates the user if the webhook has not done it yet)
export const getMe = asyncHandler(async (req, res) => {
  let user = await User.findOne({ clerkId: req.userId });

  if (!user) {
    const c = await clerkClient.users.getUser(req.userId);

    const email =
      c.primaryEmailAddress?.emailAddress ??
      c.emailAddresses[0]?.emailAddress;

    // upsert avoids duplicate users if the webhook runs at the same moment
    user = await User.findOneAndUpdate(
      { clerkId: c.id },
      {
        $setOnInsert: {
          clerkId: c.id,
          name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
          email,
          image: c.imageUrl,
          role: c.publicMetadata?.role === "admin" ? "admin" : "user",
        },
      },
      { upsert: true, new: true }
    );
  }

  res.json({ success: true, user });
});

// PUT /api/users/me
export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  // only update fields that were actually sent
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;

  const user = await User.findOneAndUpdate(
    { clerkId: req.userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, user });
});
