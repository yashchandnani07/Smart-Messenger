import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Message from "./models/Message.js";

const DEMO_USERS = [
    {
        fullName: "Yash",
        email: "yash@demo.sm",
        password: "demo123",
        bio: "Hey there! I'm Yash 👋",
    },
    {
        fullName: "Siya",
        email: "siya@demo.sm",
        password: "demo123",
        bio: "Hi! I'm Siya, nice to meet you 😊",
    },
];

const SEED_MESSAGES = [
    { from: "Yash", to: "Siya", text: "Hey Siya! 👋 How's it going?" },
    { from: "Siya", to: "Yash", text: "Hey Yash! All good, just checking out this app 😄" },
    { from: "Yash", to: "Siya", text: "Right? The real-time messaging is pretty cool!" },
    { from: "Siya", to: "Yash", text: "Yeah, messages arrive instantly. Love it!" },
    { from: "Yash", to: "Siya", text: "You can also send images 📷" },
    { from: "Siya", to: "Yash", text: "Oh nice! And what's the summary button for?" },
    { from: "Yash", to: "Siya", text: "It uses AI to summarize the whole conversation for you 🤖" },
    { from: "Siya", to: "Yash", text: "That's super useful. Smart Messenger indeed! 🚀" },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "chat-app" });
        console.log("✅ Connected to MongoDB");

        // Upsert demo users
        const userMap = {};
        for (const u of DEMO_USERS) {
            let existing = await User.findOne({ email: u.email });
            if (!existing) {
                const hashed = await bcrypt.hash(u.password, 10);
                existing = await User.create({ ...u, password: hashed });
                console.log(`  Created user: ${u.fullName}`);
            } else {
                console.log(`  User already exists: ${u.fullName}`);
            }
            userMap[u.fullName] = existing;
        }

        // Check if messages already seeded
        const yash = userMap["Yash"];
        const siya = userMap["Siya"];
        const existing = await Message.countDocuments({
            $or: [
                { senderId: yash._id, receiverId: siya._id },
                { senderId: siya._id, receiverId: yash._id },
            ],
        });

        if (existing > 0) {
            console.log(`  Messages already seeded (${existing} found), skipping.`);
        } else {
            for (const msg of SEED_MESSAGES) {
                const sender = userMap[msg.from];
                const receiver = userMap[msg.to];
                await Message.create({ senderId: sender._id, receiverId: receiver._id, text: msg.text, seen: true });
            }
            console.log(`  Seeded ${SEED_MESSAGES.length} messages between Yash and Siya`);
        }

        console.log("\n✅ Done! Demo accounts ready:");
        console.log("   Yash  →  yash@demo.sm  /  demo123");
        console.log("   Siya  →  siya@demo.sm  /  demo123");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed failed:", err.message);
        process.exit(1);
    }
}

seed();
