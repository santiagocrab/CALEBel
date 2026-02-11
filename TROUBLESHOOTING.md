# Troubleshooting: Sign-In "Failed to Fetch" Error

## Common Causes

### 1. Backend Not Running
**Solution:** Make sure the backend server is running:
```powershell
cd backend
$env:DATABASE_URL="postgres://calebel:calebel@localhost:5432/calebel"
$env:CORS_ORIGINS="http://localhost:3005"
npm run dev
```

### 2. Backend Not Restarted After Adding Auth Routes
**Solution:** If you just added the sign-in functionality, restart the backend:
1. Stop the backend (Ctrl+C in the terminal running it)
2. Start it again with `npm run dev`

### 3. CORS Issues
**Solution:** Make sure `CORS_ORIGINS` includes your frontend URL:
```powershell
$env:CORS_ORIGINS="http://localhost:3005"
```

### 4. Wrong API Base URL
**Solution:** Check that your frontend has the correct API URL:
- Check browser console for the actual URL being called
- Should be: `http://localhost:4000/api/auth/signin/request`
- Verify `VITE_API_BASE_URL` is set in your frontend environment

### 5. Database Connection Issues
**Solution:** Make sure PostgreSQL is running:
```powershell
docker compose up -d
```

## Testing the Endpoint

You can test if the backend route is working by checking:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try signing in
4. Look for the request to `/api/auth/signin/request`
5. Check the response status and error message

## Quick Fix Checklist

- [ ] Backend is running on port 4000
- [ ] Backend was restarted after adding auth routes
- [ ] Frontend is running on port 3005
- [ ] Database is running (PostgreSQL)
- [ ] CORS_ORIGINS includes `http://localhost:3005`
- [ ] No errors in backend console
- [ ] No errors in browser console
