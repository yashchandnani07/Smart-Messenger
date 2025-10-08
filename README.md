# Smart Messenger

A full-stack real-time chat application with AI-powered conversation summarization capabilities. Built with React, Node.js, Express, MongoDB, and Groq AI.

## 🌟 Features

- **Real-time Messaging**: Instant one-on-one text messaging with online/offline status indicators
- **AI Conversation Summarization**: Generate structured summaries of conversations using Groq AI
- **Image Sharing**: Send and receive images with Cloudinary integration
- **User Authentication**: Secure JWT-based authentication system
- **Profile Management**: Update user profiles with bio, name, and profile pictures
- **Read Receipts**: Message seen indicators
- **Unread Message Counters**: Visual indicators for unread messages
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React**: Component-based UI library
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.io Client**: Real-time bidirectional communication
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **Socket.io**: Real-time bidirectional event-based communication
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: Authentication and authorization
- **Bcrypt**: Password hashing
- **Cloudinary**: Cloud-based image storage and management

### AI Integration
- **Groq**: AI-powered conversation summarization using Llama 3.1 8B Instant model

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- Cloudinary account
- Groq API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yashchandnani07/Smart-Messenger
cd smart-messenger
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables**

Create a `.env` file in the `server` directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
NODE_ENV=development
```

Create a `.env` file in the `frontend` directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

5. **Run the application**

Start the backend server:
```bash
cd server
npm run server  # or npm start for production
```

Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password
- `PUT /api/auth/update-profile` - Update user profile (requires authentication)
- `GET /api/auth/check` - Check if user is authenticated (requires valid JWT)

### Messages
- `GET /api/messages/users` - Get all users for sidebar (requires authentication)
- `GET /api/messages/:id` - Get messages with a specific user (requires authentication)
- `POST /api/messages/send/:id` - Send a message to a user (requires authentication)
- `PUT /api/messages/mark/:id` - Mark a message as seen (requires authentication)

### AI Summarization
- `POST /api/summary/generate` - Generate conversation summary (requires authentication)

## 🤖 AI Summarization

The Smart Messenger features AI-powered conversation summarization using Groq's Llama 3.1 8B Instant model. The summary includes:

- Key discussion points
- Tasks and action items
- Scheduled events
- Important decisions
- Topics related to specific users

To use the AI summary feature:
1. Select a conversation
2. Click the "📋 Summary" button
3. Wait for the AI to process the conversation
4. View the structured summary in the modal

## 🗂️ Project Structure

```
smart-messenger/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── assets/         # Static assets
│   │   └── lib/            # Utility functions
│   ├── public/             # Public assets
│   └── ...
├── server/
│   ├── controllers/        # API controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Middleware functions
│   ├── lib/                # Utility functions
│   └── ...
└── README.md
```

## 🚨 Environment Variables

### Server
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `GROQ_API_KEY`: API key for Groq AI service
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `PORT`: Port number for the server (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Frontend
- `VITE_BACKEND_URL`: URL of the backend server

## 🔐 Security Features

- JWT-based authentication for all protected routes
- Password hashing with bcrypt
- Input validation and sanitization
- Secure file uploads with Cloudinary
- Rate limiting for API endpoints (when deployed)

## 📱 Mobile Responsiveness

The application is designed to work on various screen sizes:
- Desktop: Full three-column layout with sidebar, chat window, and right sidebar
- Mobile: Collapsible sidebar and simplified interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a pull request

