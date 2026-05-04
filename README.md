# 🌤️ WeatherNow — Full Stack Weather Application - https://weather-app-new-g4xu.onrender.com
### Built by SAMEER SHAMRAO SUKHADEVE

A full-stack weather web application built for the PM Accelerator Technical Assessment.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Weather API | OpenWeatherMap |
| Map | Google Maps Embed |

---

## 📦 Requirements — All Libraries & Packages

### Backend packages (Node.js)
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web server framework |
| mysql2 | ^3.6.5 | MySQL database connection |
| axios | ^1.6.0 | HTTP requests to weather API |
| dotenv | ^16.3.1 | Load environment variables |
| cors | ^2.8.5 | Allow frontend to talk to backend |
| pdfkit | ^0.14.0 | Generate PDF exports |
| nodemon | ^3.0.2 | Auto-restart server during dev |

### Frontend packages (React)
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | Render React to browser |
| react-scripts | 5.0.1 | Build tools for React |
| axios | ^1.6.0 | HTTP requests to backend |

---

## ⚙️ Setup Instructions — Step by Step

### Step 1 — Prerequisites
Make sure you have these installed on your computer:
- **Node.js** (v18 or higher) → https://nodejs.org
- **MySQL** (v8.0 or higher) → https://dev.mysql.com/downloads/installer/
- **Git** → https://git-scm.com

### Step 2 — Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/weather-app.git
cd weather-app
```

### Step 3 — Set up the database
Open MySQL and run:
```sql
CREATE DATABASE weatherapp;
```
The tables are created automatically when the backend starts.

### Step 4 — Configure backend environment
```bash
cd backend
copy .env.example .env
```
Open `.env` and fill in your values:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=weatherapp
OPENWEATHER_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000

### Step 5 — Install and run the backend
```bash
cd backend
npm install
npm run dev
```
You should see:
✅  Database table ready (weather_searches)
🚀  Backend running at http://localhost:5000

### Step 6 — Install and run the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm start
```
Browser opens automatically at **http://localhost:3000**

---

## 🌐 API Configuration

### OpenWeatherMap (Free)
1. Sign up at https://openweathermap.org
2. Go to My API Keys
3. Copy your key into `.env` as `OPENWEATHER_API_KEY`
4. Note: New keys take 10–60 minutes to activate

---

## ✅ Features Implemented

- 🔍 Search weather by city, zip code, GPS coordinates, or landmark
- 📍 Auto-detect current location using GPS
- 🌡️ Current weather — temperature, humidity, wind speed, condition
- 📅 5-day weather forecast
- 🗺️ Google Maps location embed
- 💾 Full CRUD operations on saved searches (MySQL)
- 📤 Export data in JSON, CSV, XML, PDF, Markdown
- ⚠️ Input validation and error handling
- 📱 Fully responsive — desktop, tablet, mobile
- ⏳ Loading spinner during API calls

---

## 📁 Project Structure
weather-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/weatherController.js
│   ├── models/weatherModel.js
│   ├── routes/weather.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── components/
│   │   ├── services/api.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
└── README.md


---

## 👤 About the Developer
Built by **SAMEER SHAMRAO SUKHADEVE**
PM Accelerator Technical Assessment — Full Stack submission

File 2 — backend/.env.example
This is a SAFE version of your .env — no real passwords. It shows reviewers what variables are needed.
Check if this file already exists in your backend folder. If not, create it:
# Copy this file and rename it to .env
# Then fill in your actual values

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=weatherapp
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
FRONTEND_URL=http://localhost:3000

File 3 — .gitignore
This is the most important safety file — it tells GitHub what NOT to upload (passwords, huge folders).
Create this in your root weather-app folder:
# ── Node modules (huge, not needed — npm install recreates them) ──
node_modules/
backend/node_modules/
frontend/node_modules/

# ── Secret files (NEVER upload these) ──
backend/.env
.env

# ── Build output ──
frontend/build/
.dist/

# ── System files ──
.DS_Store
Thumbs.db

# ── Logs ──
*.log
npm-debug.log*

⚠️ The .env file with your REAL password must NEVER go to GitHub. This .gitignore file prevents that automatically.
