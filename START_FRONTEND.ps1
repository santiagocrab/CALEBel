# CALEBel Frontend Startup Script
# Run this script to start the frontend development server

Write-Host "🚀 Starting CALEBel Frontend Server..." -ForegroundColor Cyan
Write-Host ""

# Set environment variable for API base URL
$env:VITE_API_BASE_URL = "http://localhost:4000"

Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "  VITE_API_BASE_URL: $env:VITE_API_BASE_URL" -ForegroundColor Gray
Write-Host ""

# Check if backend is running
Write-Host "Checking backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend is not running on port 4000" -ForegroundColor Yellow
    Write-Host "   Please start the backend first using START_BACKEND.ps1" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Starting frontend server on http://localhost:3005..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Change to frontend directory and start
Set-Location frontend
npm run dev -- --port 3005
