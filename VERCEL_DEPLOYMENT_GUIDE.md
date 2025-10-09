# Vercel Deployment Guide

## Frontend Deployment

### Steps:
1. Log in to your Vercel account
2. Click "New Project" and connect to your GitHub repository
3. Select the `frontend` directory as the root
4. Add the following environment variable in Vercel dashboard:
   - `VITE_BACKEND_URL`: URL of your deployed backend (e.g., `https://your-backend-app.vercel.app`)

## Backend Deployment

### Steps:
1. Create a new Vercel project for the backend
2. Select the `server` directory as the root
3. Add the following environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `GROQ_API_KEY`: Your GROQ API key (for summary generation)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials

## Important Notes

1. The backend vercel.json is already configured in `server/vercel.json`
2. The frontend vercel.json is already configured in `frontend/vercel.json`
3. Make sure to update the environment variables in the Vercel dashboard after deployment
4. After deployment, update your frontend's VITE_BACKEND_URL to point to your deployed backend URL

## Environment Variables Setup

### Frontend Environment Variables:
- `VITE_BACKEND_URL`: Replace with your deployed backend URL (format: `https://your-app-name.vercel.app`)

### Backend Environment Variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `GROQ_API_KEY`: API key for GROQ (used in summary generation)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `NODE_ENV`: Set to `production` (optional)

## Alternative: Single Deployment with Proxy

If you prefer to deploy both frontend and backend in a single Vercel project, you could modify the setup to build the React app and serve it with the Express server. However, the current approach of separate deployments is cleaner and more scalable.

## Testing Your Deployment

After deployment:
1. Test the backend API endpoints directly
2. Verify that the frontend can connect to the backend
3. Test user registration, login, and chat functionality
4. Ensure real-time messaging via Socket.IO works correctly
5. Test image upload functionality (if using Cloudinary)
6. Verify chat summary generation (if using GROQ)