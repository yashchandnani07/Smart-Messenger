import Groq from "groq-sdk";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Generate chat summary using Groq AI
export const generateChatSummary = async (req, res) => {
  try {
    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_actual_groq_api_key_here') {
      return res.status(400).json({ 
        success: false, 
        message: "Groq API key not configured. Please add your GROQ_API_KEY to the server .env file." 
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { conversationId, user } = req.body;
    const userId = req.user._id;

    // Get recent messages (last 50) for the conversation
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: conversationId },
        { senderId: conversationId, receiverId: userId },
      ],
    })
    .populate('senderId', 'fullName')
    .populate('receiverId', 'fullName')
    .sort({ createdAt: -1 })
    .limit(50);

    if (messages.length === 0) {
      return res.json({ 
        success: false, 
        message: "No messages found in this conversation" 
      });
    }

    // Reverse to get chronological order
    messages.reverse();

    // Format messages for AI processing
    const formattedMessages = messages.map(msg => {
      const sender = msg.senderId.fullName;
      const content = msg.text || '[Image]';
      const timestamp = new Date(msg.createdAt).toLocaleString();
      return `[${timestamp}] ${sender}: ${content}`;
    }).join('\n');

    // Create AI prompt
    const prompt = `You are an AI chat summarizer for a messaging app.

Summarize the following chat conversation in a concise and natural way.
 provide a short paragraph covering the main points.

Also, identify and include (only if present, dont include these points if not necessary):
- Any tasks or action items
- Any scheduled events
- Any important decisions
- Any topics related to ${user || req.user.fullName}


IMPORTANT:
- Keep it plain text (no markdown or symbols like ** or *).
- Avoid headings if the chat is very short — just write a simple one-line summary.
- Keep the tone simple, neutral, and human-like.

Conversation: ${formattedMessages}

IMPORTANT: Format the response in plain text without any markdown formatting like ** or *. Use only line breaks and basic text formatting.`;

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const summary = chatCompletion.choices[0]?.message?.content;

    if (!summary) {
      return res.json({ 
        success: false, 
        message: "Failed to generate summary" 
      });
    }

    res.json({ 
      success: true, 
      summary,
      messageCount: messages.length 
    });

  } catch (error) {
    console.log("Summary generation error:", error.status, error.message);
    
    // Handle specific Groq API errors
    if (error.status === 401) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid Groq API key. Please check your GROQ_API_KEY in the server .env file." 
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        success: false, 
        message: "Groq API rate limit exceeded. Please try again later." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate summary. Please try again." 
    });
  }
};