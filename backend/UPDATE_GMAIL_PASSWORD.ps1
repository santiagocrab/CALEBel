# Quick script to update Gmail password in .env file
# Run this after generating a new app password from Google

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "UPDATE GMAIL APP PASSWORD" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$newPassword = Read-Host "Enter your new 16-character Gmail App Password (no spaces)"

if ($newPassword.Length -ne 16) {
    Write-Host "❌ Error: Password must be exactly 16 characters" -ForegroundColor Red
    Write-Host "   Current length: $($newPassword.Length)" -ForegroundColor Yellow
    exit 1
}

$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: .env file not found at $envFile" -ForegroundColor Red
    exit 1
}

# Read current .env
$content = Get-Content $envFile

# Update SMTP_PASS line
$updated = $content | ForEach-Object {
    if ($_ -match "^SMTP_PASS=") {
        "SMTP_PASS=$newPassword"
    } else {
        $_
    }
}

# Write back
$updated | Set-Content $envFile -Encoding UTF8

Write-Host "✅ Updated SMTP_PASS in .env file" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart the backend server (Ctrl+C then npm run dev)" -ForegroundColor White
Write-Host "  2. Try registering again" -ForegroundColor White
Write-Host ""
