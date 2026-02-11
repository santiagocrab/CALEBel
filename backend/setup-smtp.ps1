# CALEBel Backend - SMTP Environment Setup Script
# Run this before starting the backend server

$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="wvsucalebel@gmail.com"
$env:SMTP_PASS="pubogfuuopbdvhh"
$env:SMTP_FROM="CALEBel <wvsucalebel@gmail.com>"

Write-Host "✅ SMTP environment variables set!" -ForegroundColor Green
Write-Host "SMTP_HOST: $env:SMTP_HOST" -ForegroundColor Cyan
Write-Host "SMTP_USER: $env:SMTP_USER" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now run: npm run dev" -ForegroundColor Yellow
