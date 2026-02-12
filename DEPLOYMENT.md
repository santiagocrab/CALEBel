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
   - **Build Command**: `npm install --include=dev && npm run build`
     - ⚠️ **IMPORTANT**: 
       - Make sure to use `--include=dev` to install TypeScript type definitions!
       - **DO NOT** include `cd backend` since Root Directory is already set to `backend`
   - **Start Command**: `npm run start`
     - ⚠️ **DO NOT** include `cd backend` here either!
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

### Step 4: Database Migrations (Automatic!)
✅ **Migrations run automatically on server startup!** No Shell access needed.

The backend will automatically run database migrations when it starts in production mode. You'll see migration logs in the Render service logs.

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Set Environment Variables in Vercel

**CRITICAL**: Before deploying, set the backend API URL:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add this variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://calebel.onrender.com` (your Render backend URL - check your actual backend URL)
   - **Environment**: Select all (Production, Preview, Development)
3. Click **Save**

**Note**: If you don't set this, the frontend will try to connect to `http://localhost:4000` which won't work in production!

### Step 2: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import Git Repository: `santiagocrab/CALEBel`

### Step 3: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Deploy
Click "Deploy" and wait for build to complete.

**Note**: After deployment, you'll get a Vercel URL like `https://calebel.vercel.app`. You'll need this URL for the next step!

---

## 🔄 Update Backend CORS After Frontend Deployment

**🚨 CRITICAL**: After frontend is deployed on Vercel, you MUST update backend environment variables in Render, otherwise you'll get CORS errors!

### Step-by-Step Fix:

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Click on your backend service (the one running on Render)

2. **Open Environment Tab**
   - Click on the **"Environment"** tab in the left sidebar

3. **Add/Update Environment Variables**
   - Click **"Add Environment Variable"** or edit existing ones
   - Add or update these **TWO** variables:

   **Variable 1: `CORS_ORIGINS`**
   - **Key**: `CORS_ORIGINS`
   - **Value**: `https://calebel.vercel.app`
   - ⚠️ **CRITICAL**: 
     - Use the **exact URL** including `https://`
     - **NO trailing slash** (don't use `https://calebel.vercel.app/`)
     - If you have multiple origins, separate with commas: `https://calebel.vercel.app,https://www.calebel.vercel.app`

   **Variable 2: `FRONTEND_URL`**
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://calebel.vercel.app` (same as above)

4. **Save and Redeploy**
   - Click **"Save Changes"** button at the bottom
   - Render will **automatically redeploy** your backend service
   - Wait for deployment to complete (check the **"Events"** tab)
   - Look for "Deploy succeeded" message

5. **Verify It Works**
   - Visit your frontend: https://calebel.vercel.app
   - Try registering a new account
   - Check browser console (F12) - should see no CORS errors
   - Check backend logs in Render to see if requests are coming through

### 🔧 Troubleshooting CORS Errors:

**If you still see CORS errors after updating:**

1. ✅ **Verify backend redeployed**:
   - Go to Render Dashboard → Your Backend Service → **"Events"** tab
   - Make sure there's a recent deployment AFTER you saved the environment variables
   - If not, manually trigger a redeploy: **"Manual Deploy"** → **"Deploy latest commit"**

2. ✅ **Check backend logs in Render**:
   - Go to Render Dashboard → Your Backend Service → **"Logs"** tab
   - Look for these lines when the server starts:
     ```
     🌐 CORS Configuration:
       - CORS_ORIGINS env var: https://calebel.vercel.app
       - Parsed origins: [ 'https://calebel.vercel.app' ]
     ```
   - If you see `⚠️ CORS blocked origin: ...`, check what origin is being blocked
   - If you see `* (allowing all)`, the CORS_ORIGINS variable is not being read

3. ✅ **Test the health endpoint**:
   - Visit: `https://calebel.onrender.com/health` in your browser
   - You should see JSON with CORS configuration info
   - Check if `cors.origins` shows your frontend URL

4. ✅ **Double-check the URL format in Render**:
   - Go to Render Dashboard → Your Backend Service → **"Environment"** tab
   - Click on `CORS_ORIGINS` to edit it
   - ✅ Correct: `https://calebel.vercel.app`
   - ❌ Wrong: `https://calebel.vercel.app/` (trailing slash)
   - ❌ Wrong: `calebel.vercel.app` (missing https://)
   - ❌ Wrong: `http://calebel.vercel.app` (wrong protocol)
   - ❌ Wrong: `"https://calebel.vercel.app"` (quotes - don't include quotes!)
   - Make sure there are NO extra spaces before or after

5. ✅ **Temporary test - allow all origins**:
   - In Render, set `CORS_ORIGINS` to `*` (just the asterisk, nothing else)
   - Save and wait for redeploy
   - Test if registration works now
   - If it works with `*`, then the issue is the URL format
   - ⚠️ **Change it back to your actual URL after testing!**

6. ✅ **Wait for full redeploy**:
   - After saving environment variables, wait 2-3 minutes
   - Check "Events" tab to confirm deployment completed
   - Look for "Deploy succeeded" message

7. ✅ **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open in incognito/private window

8. ✅ **Check for multiple CORS_ORIGINS entries**:
   - In Render Environment tab, make sure you only have ONE `CORS_ORIGINS` variable
   - If there are duplicates, delete the old ones

**Still not working?** Check the backend logs for the exact origin being blocked and compare it character-by-character with your CORS_ORIGINS value.

**Note**: Without updating `CORS_ORIGINS`, your frontend won't be able to communicate with the backend API and you'll see errors like:
```
Access to fetch at 'https://calebel.onrender.com/api/register' from origin 'https://calebel.vercel.app' 
has been blocked by CORS policy
```

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
- Check migration logs in Render service logs (migrations run automatically on startup)
- Check PostgreSQL connection in Render dashboard
- Verify `DATABASE_URL` is correct
- If migrations fail, check that the database is accessible and `DATABASE_URL` is correct

---

## 📝 Notes

- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for always-on service
- Vercel free tier is sufficient for frontend hosting
