# CALEBel Deployment Guide

## 🚀 Deployment to Vercel (Frontend) and Render (Backend)

### Prerequisites
- GitHub repository: https://github.com/santiagocrab/CALEBel
- Vercel account
- Render account
- PostgreSQL database (Render provides free PostgreSQL)

---

## 📦 Backend Deployment (Render)

### Step 1: Create PostgreSQL Database on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Name it `calebel-db`
4. **IMPORTANT**: Copy the **Internal Database URL** (NOT the External one)
   - Internal URL looks like: `postgres://user:pass@dpg-xxxxx-a/calebel_db`
   - Use Internal URL because:
     - ✅ Faster (same network)
     - ✅ Free (no egress charges)
     - ✅ More secure
     - ✅ Works even if database is not publicly accessible

### Step 2: Deploy Backend Service
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `santiagocrab/CALEBel`
4. Configure:
   - **Name**: `calebel-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

### Step 3: Set Environment Variables
Add these in Render Dashboard → Environment:

**Required Now:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=<paste-the-INTERNAL-database-url-here>
# Example: postgres://calebel_user:password@dpg-xxxxx-a.singapore-postgres.render.com/calebel_db
# ⚠️ USE INTERNAL URL, NOT EXTERNAL!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=wvsucalebel@gmail.com
SMTP_PASS=eimsgtsmxznrbfky
SMTP_FROM=CALEBel <wvsucalebel@gmail.com>
```

**Can Set Later (after frontend is deployed):**
```
CORS_ORIGINS=https://your-frontend-url.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Important**: 
- Use the **Internal Database URL** from Render PostgreSQL
- You can set `CORS_ORIGINS` and `FRONTEND_URL` later after you deploy the frontend and get the Vercel URL
- For now, you can use a placeholder or leave them empty, then update after frontend deployment

### Step 4: Run Database Migrations
After backend is deployed, run migrations:
1. Go to Render Dashboard → Your Backend Service
2. Click "Shell" tab
3. Run: `npm run db:migrate`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import Git Repository: `santiagocrab/CALEBel`

### Step 2: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables
Add in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://calebel-backend.onrender.com
```

### Step 4: Deploy
Click "Deploy" and wait for build to complete.

---

## 🔄 Update Backend CORS After Frontend Deployment

After frontend is deployed, update backend environment variables:

1. Go to Render Dashboard → Your Backend Service → Environment
2. Update:
   - `CORS_ORIGINS`: Your Vercel frontend URL (e.g., `https://calebel.vercel.app`)
   - `FRONTEND_URL`: Your Vercel frontend URL

3. Redeploy the backend service

---

## ✅ Verification

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Visit `https://your-backend.onrender.com/health` - should return `{"status":"ok"}`
3. **Database**: Check Render PostgreSQL dashboard for tables

---

## 🐛 Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify all environment variables are set
- Ensure database migrations ran successfully
- Check PostgreSQL connection string format

### Frontend Issues
- Check Vercel build logs
- Verify `VITE_API_BASE_URL` is set correctly
- Check browser console for API errors
- Ensure backend CORS allows your frontend URL

### Database Issues
- Run migrations: `npm run db:migrate` in Render Shell
- Check PostgreSQL connection in Render dashboard
- Verify `DATABASE_URL` is correct

---

## 📝 Notes

- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for always-on service
- Vercel free tier is sufficient for frontend hosting
