import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { rewriteMessage } from "../controllers/rewriteController.js";

const rewriteRouter = express.Router();

rewriteRouter.post("/rewrite", protectRoute, rewriteMessage);

export default rewriteRouter;
