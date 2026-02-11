# Gmail App Password Setup Guide

## Error: "Username and Password not accepted"

This error means your Gmail app password is invalid. Follow these steps to fix it:

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Click **Get started** and follow the prompts to enable it
5. You'll need to verify your phone number

## Step 2: Generate an App Password

1. Go back to **Security** settings
2. Under "Signing in to Google", find **App passwords**
3. Click **App passwords**
4. Select **Mail** as the app
5. Select **Other (Custom name)** as the device
6. Type: **CALEBel Backend**
7. Click **Generate**
8. **COPY THE 16-CHARACTER PASSWORD** (it looks like: `abcd efgh ijkl mnop`)

## Step 3: Update Your .env File

1. Open `backend/.env` file
2. Update the `SMTP_PASS` line with your new app password:
   ```
   SMTP_PASS=abcdefghijklmnop
   ```
   (Remove spaces from the password - it should be 16 characters with no spaces)

## Step 4: Restart Backend

1. Stop the backend (Ctrl+C in the backend window)
2. Restart it using the START_BACKEND.ps1 script or `npm run dev`

## Troubleshooting

- **"App passwords" option not showing?**
  - Make sure 2-Step Verification is enabled first
  - Wait a few minutes after enabling 2FA

- **Still getting errors?**
  - Double-check the password has no spaces
  - Make sure you're using the app password, NOT your regular Gmail password
  - Try generating a new app password

- **Need help?**
  - Check: https://support.google.com/accounts/answer/185833
