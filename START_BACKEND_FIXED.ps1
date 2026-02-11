# CALEBel Backend Startup Script (Fixed for Execution Policy)
# Run this script to start the backend server

# Bypass execution policy for this script
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

Write-Host "🚀 Starting CALEBel Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:DATABASE_URL = "postgres://calebel:calebel@localhost:5432/calebel"
$env:CORS_ORIGINS = "http://localhost:3005"
$env:PORT = "4000"

Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "  DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Gray
Write-Host "  CORS_ORIGINS: $env:CORS_ORIGINS" -ForegroundColor Gray
Write-Host "  PORT: $env:PORT" -ForegroundColor Gray
Write-Host ""

# Check if database is running
Write-Host "Checking database..." -ForegroundColor Yellow
try {
    docker ps | Select-String "postgres" | Out-Null
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL not detected. Starting..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Change to backend directory and start
Set-Location backend
npm run dev
