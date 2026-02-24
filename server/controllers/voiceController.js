import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

export const transcribeVoice = async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No audio file provided" });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(400).json({ success: false, message: "Groq API key not configured" });
        }

        filePath = req.file.path;

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-large-v3",
            response_format: "text",
        });

        res.json({ success: true, text: transcription });
    } catch (error) {
        console.log("Voice transcription error:", error.status, error.message);

        if (error.status === 401) {
            return res.status(401).json({ success: false, message: "Invalid Groq API key." });
        }
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: "Groq rate limit exceeded. Try again later." });
        }

        res.status(500).json({ success: false, message: "Transcription failed. Please try again." });
    } finally {
        // Always clean up the temp file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};
