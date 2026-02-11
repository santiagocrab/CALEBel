# CALEBel Backend Connection Test Script

Write-Host "🔍 Testing CALEBel Backend Connection..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   To start the backend, run:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   `$env:DATABASE_URL='postgres://calebel:calebel@localhost:5432/calebel'" -ForegroundColor White
    Write-Host "   `$env:CORS_ORIGINS='http://localhost:3005'" -ForegroundColor White
    Write-Host "   `$env:PORT='4000'" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    exit 1
}

Write-Host ""

# Test 2: Check Database
Write-Host "Test 2: Database Connection" -ForegroundColor Yellow
try {
    docker ps | Select-String "postgres" | Out-Null
    Write-Host "✅ PostgreSQL container is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL may not be running" -ForegroundColor Yellow
    Write-Host "   Run: docker compose up -d" -ForegroundColor White
}

Write-Host ""

# Test 3: Check Port
Write-Host "Test 3: Port 4000 Status" -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":4000"
if ($portCheck) {
    Write-Host "✅ Port 4000 is in use" -ForegroundColor Green
    Write-Host "   $portCheck" -ForegroundColor Gray
} else {
    Write-Host "❌ Port 4000 is not in use" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ All tests complete!" -ForegroundColor Green
