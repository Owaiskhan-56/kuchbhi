import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhook = async (req, res) => {
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  let event;

  try {
    event = wh.verify(req.body.toString(), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  const { type, data } = event;

  // Save or update user
  if (type === "user.created" || type === "user.updated") {
    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        clerkId: data.id,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email_addresses?.[0]?.email_address,
        image: data.image_url,
        role: data.public_metadata?.role === "admin" ? "admin" : "user",
      },
      { upsert: true, new: true }
    );
  }

  // Delete user
  if (type === "user.deleted") {
    await User.findOneAndDelete({ clerkId: data.id });
  }

  return res.status(200).json({ success: true });
};