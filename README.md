# Smart Messenger

A full-stack real-time chat application with AI-powered features built with React, Node.js, Express, MongoDB, Socket.IO and Groq AI.

## 🌟 Features

### Core Chat
- **Real-time Messaging** — Instant one-on-one messaging via Socket.IO
- **Image Sharing** — Send and receive images with Cloudinary integration
- **Read Receipts** — Message seen indicators
- **Unread Message Counters** — Visual indicators for unread messages
- **Online/Offline Status** — Live presence indicators

### AI-Powered (Groq)
- **🎙️ Voice Messages** — Record audio, transcribed to text via Groq Whisper in real-time
- **💡 Smart Reply Suggestions** — 3 AI-generated quick-reply chips after every received message
- **🌐 Message Translator** — Translate any message to English with one click
- **✍️ AI Tone Rewriter** — Rewrite your draft in Professional, Casual, or Funny tone before sending
- **📋 Conversation Summary** — Generate a structured AI summary of any conversation

### UX Enhancements
- **⌨️ Typing Indicator** — Animated bouncing-dot bubble while the other person types
- **👤 Demo Accounts** — One-click login as Yash or Siya to explore the app instantly
- **User Authentication** — Secure JWT-based auth
- **Profile Management** — Update name, bio, and profile picture
- **Responsive Design** — Adapts to desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Vite** — Fast HMR dev server and build tool
- **Tailwind CSS** — Utility-first styling
- **Socket.IO Client** — Real-time bidirectional communication
- **React Router** — Client-side routing
- **Axios** — HTTP client

### Backend
- **Node.js 18+** / **Express** — REST API server (ES modules)
- **Socket.IO** — Real-time events (messaging, typing indicator)
- **MongoDB** + **Mongoose** — NoSQL database
- **JWT** — Authentication and route protection
- **Bcrypt** — Password hashing
- **Cloudinary** — Cloud image storage
- **Multer** — Audio file upload handling

### AI Integration
- **Groq — `whisper-large-v3`** — Voice-to-text transcription
- **Groq — `llama-3.1-8b-instant`** — Smart replies, translation, tone rewriter, conversation summary

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Groq API key ([get one free at console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yashchandnani07/Smart-Messenger
cd Smart-Messenger
```

2. **Set up environment variables**

Create `server/.env`:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3️ Setup & Start Backend

```bash
cd server
npm install
node seed.js
npm start
```

 **This will:**
- Install all backend dependencies
- Seed demo accounts: `yash@demo.sm`, `siya@demo.sm`
- Start the backend server

📍 **Backend will run on:** http://localhost:5000

### 4️ Setup & Start Frontend

```bash
cd frontend
npm install
npm run dev
```
📍 **Frontend will be available at:** http://localhost:5173

## 📦 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create a new account |
| POST | `/api/auth/login` | Login |
| PUT | `/api/auth/update-profile` | Update profile (auth required) |
| GET | `/api/auth/check` | Verify JWT token |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/users` | Get all sidebar users |
| GET | `/api/messages/:id` | Get messages with a user |
| POST | `/api/messages/send/:id` | Send a message |
| PUT | `/api/messages/mark/:id` | Mark message as seen |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/summary/generate` | Generate conversation summary |
| POST | `/api/voice/transcribe` | Transcribe audio → text (Whisper) |
| POST | `/api/smart-reply/generate` | Generate 3 quick reply suggestions |
| POST | `/api/translate/translate` | Translate a message to English |
| POST | `/api/rewrite/rewrite` | Rewrite message in a given tone |

## 🗂️ Project Structure

```
Smart-Messenger/
├── frontend/
│   ├── context/                # React context (Auth, Chat)
│   └── src/
│       ├── components/         # ChatContainer, Sidebar, RightSidebar, SummaryModal
│       ├── pages/              # HomePage, LoginPage, ProfilePage
│       ├── assets/             # Icons and images
│       └── lib/                # Utility functions
└── server/
    ├── controllers/            # userControllers, messageController, summaryController,
    │                           # voiceController, smartReplyController,
    │                           # translateController, rewriteController
    ├── models/                 # User, Message schemas
    ├── routes/                 # All route files
    ├── middleware/             # protectRoute auth middleware
    ├── lib/                    # db.js, cloudinary.js, utils.js
    ├── uploads/                # Temporary audio uploads (gitignored)
    └── seed.js                 # Demo data seeder
```

## 🔐 Security
- JWT authentication on all protected routes
- Passwords hashed with bcrypt
- Temporary audio files deleted immediately after transcription
- Cloudinary for secure media storage

## 📱 Responsiveness
- **Desktop**: Three-column layout — sidebar, chat window, right sidebar
- **Mobile**: Collapsible sidebar, simplified layout
