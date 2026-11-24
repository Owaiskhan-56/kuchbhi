
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const webhook = new Webhook(
      process.env.CLERK_WEBHOOK_SECRET
    );

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const event = webhook.verify(
      req.body.toString("utf8"),
      headers
    );

    console.log("Webhook event:", event.type);

    res.status(200).json({
      success: true,
      message: "Webhook received"
    });

  } catch (error) {
    console.error("Webhook error:", error.message);

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export default clerkWebhooks;
