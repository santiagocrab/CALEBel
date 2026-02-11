# CALEBel - Find Your Ka-Label 💕

A modern matching platform for WVSU students to find their perfect match through compatibility algorithms.

## 🚀 Features

- **User Registration**: Complete blueprint registration with email verification
- **Smart Matching**: AI-powered compatibility matching based on personality, interests, and preferences
- **Chat System**: Real-time chat with message limits and profanity filtering
- **Admin Panel**: Manage users, verify payments, and manually create matches
- **Rematch Functionality**: Request a new match for ₱20.00 if not satisfied
- **Email Notifications**: Automated emails for verification, matches, and chat notifications

## 📁 Project Structure

```
CALEBel/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express backend
└── external-frontend/ # External reference frontend
```

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router DOM

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Nodemailer (Gmail SMTP)

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://calebel-backend.onrender.com`)

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Add environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `CORS_ORIGINS`: Frontend URL (e.g., `https://calebel.vercel.app`)
   - `PORT`: `10000` (Render default)
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: Your Gmail address
   - `SMTP_PASS`: Gmail app password
   - `SMTP_FROM`: `CALEBel <your-email@gmail.com>`
   - `FRONTEND_URL`: Your frontend URL
   - `NODE_ENV`: `production`

## 📦 Installation

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:4000
```

### Backend (.env)
```
DATABASE_URL=postgres://user:password@localhost:5432/calebel
CORS_ORIGINS=http://localhost:3005
PORT=4000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=CALEBel <your-email@gmail.com>
FRONTEND_URL=http://localhost:3005
NODE_ENV=development
```

## 📝 Database Setup

1. Create PostgreSQL database
2. Run migrations:
```bash
cd backend
npm run db:migrate
```

## 🎯 Key Features

- **Registration**: ₱50.00 registration fee via GCash
- **Rematch**: ₱20.00 rematch fee if not satisfied
- **Email Verification**: OTP-based email verification
- **Compatibility Matching**: Advanced algorithm matching users
- **Admin Panel**: Full admin control over users and matches
- **Real-time Chat**: Limited message chat system

## 📧 Email Setup

See `backend/GMAIL_SETUP.md` for detailed Gmail app password setup instructions.

## 🤝 Contributing

This project is for WVSU CICT Student Council.

## 📄 License

Private - CICT Student Council, WVSU
