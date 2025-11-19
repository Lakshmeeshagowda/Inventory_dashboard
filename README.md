
# AgriFerti Inventory System

A full-stack inventory management dashboard for agriculture fertilizer shops.

## 🚀 Getting Started

This project supports two modes:
1. **Demo Mode**: Runs entirely in the browser using LocalStorage (Default).
2. **Production Mode**: Runs with a real Node.js/Express backend and MongoDB.

### 1. Running Locally (Full Stack)

**Prerequisites**: 
- Node.js installed
- MongoDB installed and running (or a Cloud Atlas URI)

**Step A: Setup Backend**
1. Open a terminal and navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *The server will start on http://localhost:5000*

**Step B: Connect Frontend**
1. Open `services/api.ts`.
2. Change the flag at the top:
   ```typescript
   const USE_REAL_BACKEND = true;
   ```
3. Run your frontend (Vite/React).
   ```bash
   npm run dev
   ```

## ☁️ Deployment Guide

### Deploy Backend (Render/Heroku/Railway)
1. Push the `backend` folder to a new repository or specify it as the root directory.
2. Set the environment variable `MONGO_URI` to your MongoDB Atlas connection string.
3. Deploy.

### Deploy Frontend (Vercel/Netlify)
1. Push the root folder (excluding `backend` if you want strict separation).
2. Set the environment variable `VITE_API_URL` to your deployed backend URL (e.g., `https://my-backend.onrender.com/api`).
3. Update `services/api.ts` to read from `import.meta.env.VITE_API_URL` instead of localhost.

## 🛠 Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + OTP Simulation
