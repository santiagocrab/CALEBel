# CALEBel Backend Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting CALEBel Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any existing Node processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Set environment variables
$env:DATABASE_URL = "postgres://calebel:calebel@localhost:5432/calebel"
$env:CORS_ORIGINS = "http://localhost:3005"
$env:PORT = "4000"
$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "587"
$env:SMTP_USER = "wvsucalebel@gmail.com"
$env:SMTP_PASS = "eimsgtsmxznrbfky"
$env:SMTP_FROM = "CALEBel <wvsucalebel@gmail.com>"
$env:NODE_ENV = "development"

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host ""
Write-Host "Starting backend server on port 4000..." -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev
