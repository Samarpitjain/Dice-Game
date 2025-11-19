# Deployment Guide

## Backend Deployment (Render)

### Step 1: Deploy Backend
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder as root directory
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Plan**: Free

### Step 2: Set Environment Variables
Add these in Render dashboard:
- `NODE_ENV`: `production`
- `JWT_SECRET`: Generate a secure random string
- `MONGO_URI`: Use Render's MongoDB or external service
- `FRONTEND_URL`: Will update after frontend deployment

### Step 3: Add Database
1. In Render dashboard, create a new PostgreSQL database (or use MongoDB Atlas)
2. Copy the connection string to `MONGO_URI`

## Frontend Deployment (Vercel)

### Step 1: Deploy Frontend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Framework preset should auto-detect as "Vite"

### Step 2: Set Environment Variables
In Vercel project settings → Environment Variables:
- `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
- `VITE_WS_URL`: `https://your-backend-url.onrender.com`

### Step 3: Update Backend CORS
After frontend deployment, update backend's `FRONTEND_URL` environment variable in Render with your Vercel URL.

## Quick Deploy Commands

### Backend (Render)
```bash
cd backend
git add .
git commit -m "Deploy to Render"
git push origin main
```

### Frontend (Vercel)
```bash
cd frontend
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

## Environment Variables Summary

### Backend (Render)
- `NODE_ENV=production`
- `PORT=10000`
- `MONGO_URI=<your-mongodb-connection-string>`
- `JWT_SECRET=<secure-random-string>`
- `FRONTEND_URL=<your-vercel-url>`

### Frontend (Vercel)
- `VITE_API_URL=<your-render-backend-url>/api`
- `VITE_WS_URL=<your-render-backend-url>`

## Post-Deployment Checklist
- [ ] Backend health check: `https://your-backend.onrender.com/health`
- [ ] Frontend loads correctly
- [ ] WebSocket connection works
- [ ] Authentication flow works
- [ ] Game functionality works
- [ ] Database operations work