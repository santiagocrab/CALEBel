# SMTP Email Setup Guide

## ✅ SMTP Configuration Complete!

Your Gmail account is configured:
- **Email**: wvsucalebel@gmail.com
- **App Password**: Configured ✅

## How to Use

### Option 1: Use the Setup Script (Recommended)

Before starting your backend server, run:

```powershell
cd backend
.\setup-smtp.ps1
npm run dev
```

This will automatically set all SMTP environment variables.

### Option 2: Set Manually in PowerShell

Before running `npm run dev`, set these variables:

```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="wvsucalebel@gmail.com"
$env:SMTP_PASS="pubogfuuopbdvhh"
$env:SMTP_FROM="CALEBel <wvsucalebel@gmail.com>"
```

### Option 3: Create a .env File

Create a `.env` file in the `backend` folder with:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=wvsucalebel@gmail.com
SMTP_PASS=pubogfuuopbdvhh
SMTP_FROM=CALEBel <wvsucalebel@gmail.com>
```

## Testing

After setting up, restart your backend server. The email service will automatically use these settings.

**Email will be sent for:**
- Email verification (OTP codes)
- Match notifications
- Chat consent confirmations
- Reveal notifications
- Recalibration confirmations

If SMTP is not configured, the backend will log: `Email skipped (SMTP not configured)` but won't crash.
