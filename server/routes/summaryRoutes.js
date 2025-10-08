import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { generateChatSummary } from "../controllers/summaryController.js";

const summaryRouter = express.Router();

summaryRouter.post("/generate", protectRoute, generateChatSummary);

export default summaryRouter;