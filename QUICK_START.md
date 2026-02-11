# 🚀 CALEBel Quick Start Guide

## Starting Both Servers

### Option 1: Use the Startup Scripts (Easiest)

**Terminal 1 - Backend:**
```powershell
.\START_BACKEND.ps1
```

**Terminal 2 - Frontend:**
```powershell
.\START_FRONTEND.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
$env:DATABASE_URL="postgres://calebel:calebel@localhost:5432/calebel"
$env:CORS_ORIGINS="http://localhost:3005"
$env:PORT="4000"
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
$env:VITE_API_BASE_URL="http://localhost:4000"
npm run dev -- --port 3005
```

## Verify Everything is Running

### Check Backend:
```powershell
Invoke-WebRequest -Uri "http://localhost:4000/health"
```
Should return: `{"status":"ok"}`

### Check Frontend:
Open your browser and go to: **http://localhost:3005**

## Common Issues

### ❌ "ERR_CONNECTION_REFUSED" on Frontend
- **Solution**: Frontend server is not running
- **Fix**: Start the frontend using `START_FRONTEND.ps1` or manual commands above

### ❌ "Failed to fetch" Errors
- **Solution**: Backend server is not running
- **Fix**: Start the backend using `START_BACKEND.ps1` or manual commands above

### ❌ Database Connection Errors
- **Solution**: PostgreSQL is not running
- **Fix**: Run `docker compose up -d` to start PostgreSQL

## Ports Used

- **Frontend**: `http://localhost:3005`
- **Backend API**: `http://localhost:4000`
- **PostgreSQL**: `localhost:5432`

## What to Do Next

1. ✅ Start backend server
2. ✅ Start frontend server
3. ✅ Open `http://localhost:3005` in your browser
4. ✅ Test sign-in or registration
5. ✅ Upload a file to test uploads

## Need Help?

- Check `FIXES_APPLIED.md` for recent fixes
- Check `BACKEND_SETUP.md` for backend details
- Check `TROUBLESHOOTING.md` for common issues
