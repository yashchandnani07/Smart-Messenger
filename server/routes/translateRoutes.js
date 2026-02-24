import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { translateMessage } from "../controllers/translateController.js";

const translateRouter = express.Router();

translateRouter.post("/translate", protectRoute, translateMessage);

export default translateRouter;
