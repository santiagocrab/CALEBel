# Fix PowerShell Execution Policy Error

## Problem
You're seeing this error:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

## Solution Options

### Option 1: Fix Execution Policy (Recommended - Permanent)
Run this command in PowerShell **as Administrator**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

Or for just your user (no admin needed):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option 2: Bypass for Current Session (Temporary)
Run this before using npm:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Option 3: Use the Fixed Scripts
I've created fixed versions of the startup scripts that bypass the policy:
- `START_FRONTEND_FIXED.ps1`
- `START_BACKEND_FIXED.ps1`

Just run these instead!

### Option 4: Run Commands Directly
Instead of using npm scripts, you can run:
```powershell
cd frontend
$env:VITE_API_BASE_URL="http://localhost:4000"
node node_modules/vite/bin/vite.js --port 3005
```

## Quick Fix (Easiest)

**Run this command:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try running npm commands again!

## What Each Policy Means

- **Restricted**: No scripts can run (default on some systems)
- **RemoteSigned**: Local scripts can run, downloaded scripts need signature
- **Unrestricted**: All scripts can run (less secure)
- **Bypass**: No restrictions (only for current process)

**RemoteSigned** is recommended - it's secure but allows your local npm scripts to run.
