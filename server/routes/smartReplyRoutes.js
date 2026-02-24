import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { generateSmartReplies } from "../controllers/smartReplyController.js";

const smartReplyRouter = express.Router();

smartReplyRouter.post("/generate", protectRoute, generateSmartReplies);

export default smartReplyRouter;
