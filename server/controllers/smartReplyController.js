import Groq from "groq-sdk";

export const generateSmartReplies = async (req, res) => {
    try {
        const { lastMessages } = req.body;

        if (!lastMessages || !Array.isArray(lastMessages)) {
            return res.status(400).json({ success: false, message: "Invalid messages format" });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(400).json({ success: false, message: "Groq API key not configured" });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const result = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a smart reply generator. Given a conversation, suggest exactly 3 short, natural reply options. Return ONLY a JSON array of 3 strings, no markdown, no explanation. Example: [\"Sure!\", \"I'll check\", \"Sounds good 👍\"]"
                },
                {
                    role: "user",
                    content: `Conversation:\n${lastMessages.map(m => `${m.sender}: ${m.text}`).join("\n")}\n\nSuggest 3 replies for the receiver.`
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 100,
        });

        try {
            // Try to parse the response as a JSON array
            const parsedArray = JSON.parse(result.choices[0].message.content);
            return res.json({ success: true, replies: parsedArray });
        } catch (parseError) {
            // Fallback if parsing fails
            console.error("Failed to parse Groq response:", result.choices[0].message.content);
            return res.json({ success: true, replies: ["Got it!", "Thanks!", "Okay 👍"] });
        }

    } catch (error) {
        console.log("Smart reply error:", error.message);
        res.status(500).json({ success: false, message: "Failed to generate replies" });
    }
};
