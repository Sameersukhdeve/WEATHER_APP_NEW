# 🌤️ Weather App - Setup & Deployment Guide

## What We Fixed ✅

Your weather app now uses:
- **SQLite database** (no external DB setup needed!)
- **Proper Vercel routing** for single-page app (SPA)
- **Async database operations** that work on Windows and Vercel
- **Production-ready build** in the `build/` folder

---

## 🚀 Quick Start (Local Testing)

### 1. **Start the Backend**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

### 2. **Start the Frontend** (in a new terminal)
```bash
npm start
```
Frontend will run on `http://localhost:3000`

### 3. **Add OpenWeatherMap API Key**
- Go to [openweathermap.org/api](https://openweathermap.org/api)
- Sign up for free tier
- Copy your API key
- Add to `.env.local`:
```
OPENWEATHER_API_KEY=your_api_key_here
```

---

## 📤 Deploy to Vercel

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Convert to SQLite and fix Vercel routing"
git push origin main
```

### 2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Select "weather-app" as root directory

### 3. **Add Environment Variables in Vercel**
In Vercel Dashboard → Settings → Environment Variables, add:

```
OPENWEATHER_API_KEY=your_api_key_here
YOUTUBE_API_KEY=your_youtube_key_here (optional)
```

### 4. **Deploy**
Vercel will automatically:
- Install dependencies
- Build React frontend (→ `build/` folder)
- Deploy serverless backend API (→ `/api` routes)
- Serve static frontend files

---

## 📁 Project Structure

```
weather-app/
├── build/                    # React production build
│   ├── index.html           # Main page
│   └── static/              # JS & CSS bundles
│
├── src/                      # React frontend
│   ├── App.js
│   ├── components/
│   ├── hooks/
│   └── services/api.js      # Backend API calls
│
├── backend/                  # Express server + SQLite
│   ├── config/
│   │   ├── db.js            # SQLite setup
│   │   └── dbHelpers.js     # Async helpers
│   ├── controllers/
│   │   └── weatherController.js
│   ├── routes/
│   ├── app.js               # Express app
│   └── server.js            # Entry point
│
├── api/                      # Vercel serverless function
│   └── [...all].js          # Routes all /api/* to backend
│
├── vercel.json              # ✅ Updated with SPA routing
└── .env.local               # Local environment variables
```

---

## 🔧 Database

### Local Storage
- Data saved to: `./data/weather.db` (auto-created)
- Persistent between restarts

### Vercel Storage
- Data saved to: `/tmp/weather.db` (session storage)
- Data persists within same Vercel deployment
- Use Vercel KV or Postgres for persistent data across deployments

---

## ⚙️ Key Changes Made

### 1. **Database Migration**
- ❌ Removed: `mysql2` (needed external MySQL server)
- ✅ Added: `sqlite3` (file-based, works everywhere)

### 2. **Async API**
- All database operations now use Promises
- Works on Windows and serverless environments
- No compilation issues

### 3. **Vercel Configuration**
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/[...all]"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🧪 Testing API Endpoints Locally

Once backend is running:

```bash
# Create weather record
curl -X POST http://localhost:5000/api/weather \
  -H "Content-Type: application/json" \
  -d '{"location":"London"}'

# Get all records
curl http://localhost:5000/api/weather

# Health check
curl http://localhost:5000/api/health
```

---

## 🐛 Troubleshooting

### "Cannot find OpenWeatherMap API key"
→ Add `OPENWEATHER_API_KEY` to `.env.local`

### Database errors on Windows
→ Already fixed! Using `sqlite3` instead of `better-sqlite3`

### 404 errors on Vercel
→ Fixed in `vercel.json` with proper SPA routing

### API calls timeout
→ Increase timeout in `src/services/api.js`:
```javascript
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000  // Increase from 15000
});
```

---

## 📚 Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [SQLite vs MySQL](https://www.sqlite.org/whentouse.html)
- [React Deployment](https://create-react-app.dev/deployment/)

---

## ✨ Next Steps

1. ✅ Test locally
2. ✅ Push to GitHub
3. ✅ Deploy to Vercel
4. 🎯 Your app is live! 🚀

---

**Your weather app is now ready for deployment!**

Questions? Check the error logs in your terminal or Vercel dashboard.
