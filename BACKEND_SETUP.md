# Backend Setup & Connection Guide

## ✅ Backend is Now Running

The backend server has been started with the following configuration:

### Environment Variables Set:
- `DATABASE_URL`: `postgres://calebel:calebel@localhost:5432/calebel`
- `CORS_ORIGINS`: `http://localhost:3005`
- `PORT`: `4000`

### Backend Endpoints:
- **Health Check**: `http://localhost:4000/health`
- **Upload**: `POST http://localhost:4000/api/upload`
- **Sign In**: `POST http://localhost:4000/api/auth/signin/request`
- **Register**: `POST http://localhost:4000/api/register`
- **Match**: `GET http://localhost:4000/api/match/:userId`
- **Chat**: `GET http://localhost:4000/api/chat/:matchId`
- **Verify**: `POST http://localhost:4000/api/verify/request`

### File Upload Configuration:
- **Upload Directory**: `backend/uploads/` (created automatically)
- **Max File Size**: 5MB
- **Allowed Types**: jpg, png, webp
- **Upload Route**: `/api/upload`
- **Static Files**: Served from `/uploads` route

### Frontend Connection:
- Frontend should be running on: `http://localhost:3005`
- API Base URL: `http://localhost:4000` (set via `VITE_API_BASE_URL`)
- CORS is configured to allow requests from `http://localhost:3005`

## Testing the Connection

### 1. Test Backend Health:
```powershell
Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET
```

### 2. Test File Upload:
1. Go to registration page
2. Upload a payment proof image
3. Check that it uploads successfully

### 3. Test Sign In:
1. Go to `/signin` page
2. Enter a registered WVSU email
3. Check that OTP is sent

## Troubleshooting

### Backend Not Starting:
1. Check if PostgreSQL is running: `docker compose up -d`
2. Check if port 4000 is available
3. Check backend terminal for errors

### Upload Not Working:
1. Verify `backend/uploads/` directory exists
2. Check file size (must be < 5MB)
3. Check file type (jpg, png, webp only)
4. Check browser console for CORS errors

### Frontend Can't Connect:
1. Verify backend is running on port 4000
2. Check `VITE_API_BASE_URL` in frontend
3. Check CORS_ORIGINS includes frontend URL
4. Check browser console for network errors

## Restarting Backend

If you need to restart the backend:

```powershell
cd backend
$env:DATABASE_URL="postgres://calebel:calebel@localhost:5432/calebel"
$env:CORS_ORIGINS="http://localhost:3005"
$env:PORT="4000"
npm run dev
```

## Current Status

✅ Backend server started
✅ Uploads directory created
✅ Routes registered (including auth routes)
✅ CORS configured
✅ Static file serving enabled

The backend is ready to accept requests from the frontend!
