# Script to match two users
# Usage: .\MATCH_USERS.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "💕 Matching Users" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$email1 = "adatamia.misplacido@wvsu.edu.ph"
$email2 = "james.remegio@wvsu.edu.ph"

Write-Host "Email 1: $email1" -ForegroundColor Yellow
Write-Host "Email 2: $email2" -ForegroundColor Yellow
Write-Host ""

# Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Call the match API
Write-Host "Calling match API..." -ForegroundColor Cyan
try {
    $body = @{
        email1 = $email1
        email2 = $email2
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/test/match-users" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -TimeoutSec 10
    $data = $response.Content | ConvertFrom-Json

    Write-Host ""
    Write-Host "✅✅✅ MATCH CREATED SUCCESSFULLY! ✅✅✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "Match ID: $($data.matchId)" -ForegroundColor Cyan
    Write-Host "User 1: $($data.user1.email)" -ForegroundColor Yellow
    Write-Host "   User ID: $($data.user1.userId)" -ForegroundColor Gray
    Write-Host "   Alias: $($data.user1.alias)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "User 2: $($data.user2.email)" -ForegroundColor Yellow
    Write-Host "   User ID: $($data.user2.userId)" -ForegroundColor Gray
    Write-Host "   Alias: $($data.user2.alias)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Both users can now:" -ForegroundColor Green
    Write-Host "  ✅ Sign in with their email" -ForegroundColor Green
    Write-Host "  ✅ Enter OTP code" -ForegroundColor Green
    Write-Host "  ✅ Go to /chat automatically" -ForegroundColor Green
    Write-Host "  ✅ Start chatting immediately!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ Error matching users:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $errorData = $responseBody | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        if ($errorData) {
            Write-Host ""
            Write-Host "   Error details:" -ForegroundColor Yellow
            Write-Host "   $($errorData.error)" -ForegroundColor Yellow
        } else {
            Write-Host "   Response: $responseBody" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "  - One or both users are not registered" -ForegroundColor Gray
    Write-Host "  - Users are already matched" -ForegroundColor Gray
    Write-Host "  - Backend error (check backend console)" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
