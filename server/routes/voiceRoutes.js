import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/auth.js";
import { transcribeVoice } from "../controllers/voiceController.js";

const voiceRouter = express.Router();

// Configure multer storage to preserve file extension
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + ".webm");
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 },
});

voiceRouter.post("/transcribe", protectRoute, upload.single("audio"), transcribeVoice);

export default voiceRouter;
