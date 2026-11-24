
import express from "express";
import clerkWebhooks from "../controllers/webhookController.js";

const webhookRouter = express.Router();

webhookRouter.post("/", clerkWebhooks);

export default webhookRouter;
