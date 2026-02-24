import Groq from "groq-sdk";

export const translateMessage = async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "No text provided" });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(400).json({ success: false, message: "Groq API key not configured" });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const result = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "You are a translator. Translate the given text to the target language. Return ONLY the translated text, nothing else. No quotes, no explanation.",
                },
                {
                    role: "user",
                    content: `Translate to ${targetLanguage || "English"}: ${text}`,
                },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            max_tokens: 500,
        });

        res.json({ success: true, translatedText: result.choices[0].message.content });
    } catch (error) {
        console.log("Translation error:", error.message);
        res.status(500).json({ success: false, message: "Translation failed. Please try again." });
    }
};
