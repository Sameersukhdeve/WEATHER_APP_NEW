<<<<<<< HEAD
# ⛅ SkyWatch — Full Stack Weather Application

A complete weather web application built with **React.js**, **Node.js/Express**, and **MySQL**.
Search any location to get real-time weather data, view a 5-day forecast, save your searches,
and manage them with full CRUD (Create, Read, Update, Delete) operations.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites — Install These First](#prerequisites)
5. [Step 1 — Get API Keys](#step-1--get-your-api-keys)
6. [Step 2 — Set Up MySQL](#step-2--set-up-mysql)
7. [Step 3 — Set Up the Backend](#step-3--set-up-the-backend)
8. [Step 4 — Set Up the Frontend](#step-4--set-up-the-frontend)
9. [Step 5 — Run the App](#step-5--run-the-app)
10. [How to Use the App](#how-to-use-the-app)
11. [API Endpoints Reference](#api-endpoints-reference)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Features

- 🔍 **Search** by city name, zip code, GPS coordinates, or any landmark
- 📍 **Auto-detect** your location using the browser's built-in geolocation
- 🌡️ **Current weather** — temperature, humidity, wind speed, feels-like, condition icon
- 📅 **5-Day Forecast** — daily high/low temperatures with weather icons
- 🗺️ **Map** — embedded map showing the searched location (OpenStreetMap, no API key required)
- ▶️ **YouTube Videos** — travel videos for the searched location (optional, requires YouTube API key)
- 💾 **Save history** — every search is saved to MySQL automatically
- ✏️ **Edit records** — update the location or date range of any saved record
- 🗑️ **Delete records** — remove any saved record
- ⬇️ **Export data** — download all records as JSON, CSV, or Markdown
- ⚡ **Loading states** — spinner shown during all API calls
- ⚠️ **Error handling** — clear messages for not-found locations, API failures, network errors
- 📱 **Responsive design** — works on desktop, tablet, and mobile

---

## Tech Stack

| Layer     | Technology             | Purpose                              |
|-----------|------------------------|--------------------------------------|
| Frontend  | React.js 18            | UI components and state management   |
| Frontend  | Axios                  | HTTP requests to the backend         |
| Backend   | Node.js + Express.js   | REST API server                      |
| Backend   | mysql2                 | MySQL database driver                |
| Database  | MySQL 8.x              | Persistent data storage              |
| Weather   | OpenWeatherMap API     | Real-time weather data               |
| Map       | OpenStreetMap (free)   | Location map embed                   |
| Videos    | YouTube Data API v3    | Travel videos (optional)             |

---

## Project Structure

```
weather-app/
│
├── backend/                      ← Node.js/Express server
│   ├── config/
│   │   └── db.js                 ← MySQL connection + auto table creation
│   ├── controllers/
│   │   └── weatherController.js  ← All business logic (CRUD + exports + YouTube)
│   ├── middleware/
│   │   └── validate.js           ← Input validation rules
│   ├── routes/
│   │   └── weather.js            ← URL route definitions
│   ├── .env.example              ← Template for your .env file
│   ├── package.json              ← Backend dependencies
│   └── server.js                 ← App entry point
│
└── frontend/                     ← React application
    ├── public/
    │   └── index.html            ← HTML template
    ├── src/
    │   ├── components/
    │   │   ├── SearchBar.jsx         ← Location input + geolocation
    │   │   ├── WeatherCard.jsx       ← Current weather display
    │   │   ├── Forecast.jsx          ← 5-day forecast grid
    │   │   ├── MapEmbed.jsx          ← Map integration
    │   │   ├── YouTubeSection.jsx    ← YouTube videos
    │   │   ├── WeatherHistory.jsx    ← Saved records table (CRUD)
    │   │   ├── ExportSection.jsx     ← Download buttons
    │   │   └── LoadingSpinner.jsx    ← Loading indicator
    │   ├── hooks/
    │   │   └── useWeather.js         ← All weather state + API call logic
    │   ├── services/
    │   │   └── api.js                ← All backend API calls in one place
    │   ├── App.js                    ← Root component (assembles everything)
    │   ├── App.css                   ← All styles
    │   └── index.js                  ← React entry point
    ├── .env.example              ← Template for frontend .env
    └── package.json              ← Frontend dependencies
```

---

## Prerequisites

Before starting, install these programs on your computer.

### 1. Node.js (includes npm)

- Download from: https://nodejs.org
- Choose the **LTS (Long Term Support)** version
- After installing, verify it works. Open your terminal/command prompt and type:
  ```bash
  node --version
  # Should print something like: v20.11.0

  npm --version
  # Should print something like: 10.2.3
  ```

### 2. MySQL Server

- Download from: https://dev.mysql.com/downloads/mysql/
- Or use **XAMPP** (easier for beginners): https://www.apachefriends.org/
  - XAMPP includes MySQL and phpMyAdmin (a visual database manager)
- After installing, make sure MySQL is running
- Remember the **root password** you set during installation

### 3. Git (optional, for version control)

- Download from: https://git-scm.com/

---

## Step 1 — Get Your API Keys

You need at least **one API key** (OpenWeatherMap) to run the app.
The others are optional.

### 🌤️ OpenWeatherMap API Key (REQUIRED)

This provides the actual weather data. It's free.

1. Go to https://openweathermap.org/
2. Click **Sign In** → **Create an Account**
3. Fill in your details and verify your email
4. After logging in, click your username (top right) → **My API Keys**
5. You'll see a default key. Copy it.
6. ⚠️ **Important**: New API keys take **10-60 minutes** to activate!
   If you get a 401 error, wait and try again.

### ▶️ YouTube API Key (OPTIONAL)

This shows travel videos for searched locations.

1. Go to https://console.cloud.google.com/
2. Create a new project (click the project dropdown → New Project)
3. In the search bar, search for "YouTube Data API v3"
4. Click on it → click **Enable**
5. Go to **Credentials** (left sidebar) → **Create Credentials** → **API Key**
6. Copy the API key shown

### 🗺️ Google Maps API Key (OPTIONAL)

The app uses free OpenStreetMap by default, so this is truly optional.

1. Same Google Cloud Console as above
2. Enable **Maps Embed API**
3. Create an API key as above

---

## Step 2 — Set Up MySQL

### If using XAMPP:
1. Open XAMPP Control Panel
2. Click **Start** next to MySQL
3. Click **Admin** to open phpMyAdmin
4. You don't need to create a database manually — the app does it automatically!

### If using MySQL directly:
1. Open your terminal
2. Log in to MySQL:
   ```bash
   mysql -u root -p
   # Enter your MySQL password when prompted
   ```
3. You can exit with:
   ```sql
   exit;
   ```
The app will **automatically create the database and table** when the backend starts.

---

## Step 3 — Set Up the Backend

Open a **terminal/command prompt** and follow these steps:

### 3a. Navigate to the backend folder
```bash
cd weather-app/backend
```

### 3b. Install all dependencies
```bash
npm install
```
This reads `package.json` and installs all required packages into a `node_modules` folder.
It may take 1-2 minutes. You'll see a lot of text — that's normal.

### 3c. Create your .env file
The `.env` file stores your secret configuration (API keys, database password).

**On Windows:**
```bash
copy .env.example .env
```

**On Mac/Linux:**
```bash
cp .env.example .env
```

### 3d. Edit the .env file
Open `backend/.env` in any text editor (Notepad, VS Code, etc.) and fill in your values:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password_here
DB_NAME=weather_app_db
DB_PORT=3306

OPENWEATHER_API_KEY=paste_your_openweathermap_key_here

YOUTUBE_API_KEY=paste_your_youtube_key_here_or_leave_as_is

GOOGLE_MAPS_API_KEY=paste_your_google_maps_key_here_or_leave_as_is

FRONTEND_URL=http://localhost:3000
```

> 💡 **Tip**: If your MySQL has no password (common in XAMPP defaults), leave `DB_PASSWORD=` blank.

---

## Step 4 — Set Up the Frontend

Open a **second terminal** (keep the first one for the backend) and:

### 4a. Navigate to the frontend folder
```bash
cd weather-app/frontend
```

### 4b. Install all dependencies
```bash
npm install
```
This installs React and all other frontend packages. Takes 2-5 minutes.

### 4c. Create your .env file (optional)
Only needed if you have a Google Maps API key:

**Windows:** `copy .env.example .env`
**Mac/Linux:** `cp .env.example .env`

Then edit `frontend/.env`:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

If you skip this, the app uses free OpenStreetMap instead — perfectly fine!

---

## Step 5 — Run the App

You need **two terminals running at the same time**: one for the backend, one for the frontend.

### Terminal 1 — Start the Backend
```bash
cd weather-app/backend
npm run dev
```

You should see:
```
✅ Database "weather_app_db" is ready.
✅ Table "weather_records" is ready.

=========================================
🚀 Server running at http://localhost:5000
🏥 Health check: http://localhost:5000/api/health
📡 Weather API:  http://localhost:5000/api/weather
=========================================
```

**Verify it's working** — open your browser and visit:
http://localhost:5000/api/health

You should see:
```json
{"success":true,"message":"🌤️ Weather App Backend is running!"}
```

### Terminal 2 — Start the Frontend
```bash
cd weather-app/frontend
npm start
```

After about 30 seconds, your browser should automatically open:
http://localhost:3000

If it doesn't open automatically, open it manually.

---

## How to Use the App

### Searching for Weather
1. Type a location in the search box. Examples:
   - City name: `Tokyo` or `Mumbai` or `New York`
   - City + Country: `Paris, FR`
   - ZIP code: `10001`
   - GPS coordinates: `28.6139,77.2090`
2. Click **⚡ Get Weather**
3. Weather data will appear below the search bar
4. The search is automatically saved to the history table

### Using My Location
1. Click the **📍 My Location** button
2. Your browser will ask permission to access your location — click Allow
3. Weather for your current location will appear

### Adding Date Ranges
1. Click **▼ Add date range (optional)** below the search bar
2. Select a start and end date
3. The dates are saved alongside the weather data for reference

### Editing a Saved Record
1. Scroll down to the **Search History** table
2. Find the record you want to change
3. Click ✏️ **Edit**
4. Change the location or dates
5. Click 💾 **Save**
6. If you changed the location, new weather data will be fetched automatically

### Deleting a Record
1. In the history table, click 🗑️ on the record you want to remove
2. Confirm the deletion in the popup

### Exporting Data
1. Scroll to the **Export Data** section
2. Click one of: **{ } Export JSON**, **📊 Export CSV**, or **📝 Export Markdown**
3. Your browser will download the file automatically

---

## API Endpoints Reference

The backend exposes these REST API endpoints:

| Method | URL                        | Description                          |
|--------|----------------------------|--------------------------------------|
| POST   | /api/weather               | Fetch weather + save to DB           |
| GET    | /api/weather               | Get all saved records                |
| GET    | /api/weather?search=tokyo  | Filter records by location           |
| GET    | /api/weather/:id           | Get one record by ID                 |
| PUT    | /api/weather/:id           | Update a record                      |
| DELETE | /api/weather/:id           | Delete a record                      |
| GET    | /api/weather/export/json   | Download all records as JSON         |
| GET    | /api/weather/export/csv    | Download all records as CSV          |
| GET    | /api/weather/export/markdown | Download all records as Markdown   |
| GET    | /api/weather/youtube/:loc  | Get YouTube videos for a location    |
| GET    | /api/health                | Health check                         |

### Example POST request body:
```json
{
  "location": "Mumbai",
  "date_range_start": "2024-06-01",
  "date_range_end": "2024-06-07"
}
```

---

## Deployment

### Frontend Deployment (Vercel)

1. **Deploy Frontend to Vercel:**
   - Push your code to GitHub
   - Connect your GitHub repo to Vercel
   - Vercel will automatically detect the React app and deploy it

2. **Set Environment Variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add: `REACT_APP_API_URL=https://your-backend-url.vercel.app/api`

### Backend Deployment Options

Choose one of these services to deploy your backend:

#### Option A: Vercel (Serverless Functions)
- Deploy the entire `backend/` folder as serverless functions
- Update the frontend `REACT_APP_API_URL` to point to your Vercel backend URL

#### Option B: Railway
1. Create a Railway account
2. Connect your GitHub repo
3. Railway will auto-detect Node.js and deploy
4. Add environment variables in Railway dashboard
5. Update frontend with the Railway backend URL

#### Option C: Render
1. Create a Render account
2. Create a new Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm run dev`
6. Add environment variables
7. Update frontend with the Render backend URL

### Database Deployment

For production, use a cloud database service:
- **PlanetScale** (MySQL-compatible)
- **Railway** (includes free database)
- **AWS RDS** (MySQL)
- **Google Cloud SQL**

Update your `.env` file with the production database credentials.

---

## Troubleshooting

### ❌ "Cannot connect to the server"
- Make sure the backend is running (`npm run dev` in the backend folder)
- Check that port 5000 is not in use by another program

### ❌ "Location not found"
- Check your spelling
- Try adding the country code: `London, GB`
- Wait 10-60 minutes if you just created your OpenWeatherMap API key

### ❌ "Invalid API key"
- Double-check your `OPENWEATHER_API_KEY` in `backend/.env`
- Make sure there are no spaces before or after the key
- New keys can take up to 1 hour to activate

### ❌ "Database initialization failed"
- Make sure MySQL is running
- Check your `DB_PASSWORD` in `backend/.env`
- If using XAMPP, make sure the MySQL module is started (green light)
- If your MySQL root has no password, set `DB_PASSWORD=` (blank)

### ❌ Port 3000 already in use
- React will ask if you want to use a different port — type `y` and press Enter

### ❌ `npm install` fails
- Make sure Node.js is installed: `node --version`
- Try deleting the `node_modules` folder and running `npm install` again
- On Windows, run the terminal as Administrator
=======
# WEATHER-_APP
A full-stack weather web application.
>>>>>>> 93ffbe9 (Initial commit)
