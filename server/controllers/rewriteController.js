import Groq from "groq-sdk";

export const rewriteMessage = async (req, res) => {
    try {
        const { text, tone } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "No text provided" });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(400).json({ success: false, message: "Groq API key not configured" });
        }

        const validTones = ["professional", "casual", "funny"];
        const selectedTone = validTones.includes(tone) ? tone : "casual";

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const result = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You rewrite messages in a ${selectedTone} tone. Return ONLY the rewritten message. No quotes, no explanation, no extra text.`,
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 300,
        });

        res.json({ success: true, rewrittenText: result.choices[0].message.content });
    } catch (error) {
        console.log("Rewrite error:", error.message);
        res.status(500).json({ success: false, message: "Rewrite failed. Please try again." });
    }
};
