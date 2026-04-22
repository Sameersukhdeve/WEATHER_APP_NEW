// ============================================================
// App.js
// ============================================================
// This is the ROOT component of the React application.
// It brings together all other components and the useWeather hook.
//
// Component tree:
//   App
//   ├── Header (static HTML inside App)
//   ├── SearchBar        (location input + date range + geolocation)
//   ├── ErrorBanner      (shown when there's an error)
//   ├── LoadingSpinner   (shown while fetching)
//   ├── WeatherCard      (current weather display)
//   ├── Forecast         (5-day forecast grid)
//   ├── MapEmbed         (OpenStreetMap or Google Maps)
//   ├── YouTubeSection   (related YouTube videos)
//   ├── ExportSection    (download buttons)
//   └── WeatherHistory   (table of all saved records)
// ============================================================

import React, { useEffect } from 'react';
import './App.css';

// Import all our custom components
import SearchBar       from './components/SearchBar';
import WeatherCard     from './components/WeatherCard';
import Forecast        from './components/Forecast';
import MapEmbed        from './components/MapEmbed';
import YouTubeSection  from './components/YouTubeSection';
import WeatherHistory  from './components/WeatherHistory';
import ExportSection   from './components/ExportSection';
import LoadingSpinner  from './components/LoadingSpinner';

// Import our custom hook that handles all the weather logic
import useWeather from './hooks/useWeather';

function App() {
  // Destructure everything we need from our custom hook
  const {
    currentWeather,
    records,
    loading,
    error,
    videos,
    searchWeather,
    loadRecords,
    removeRecord,
    editRecord,
    detectLocation,
    clearError
  } = useWeather();

  // ---- SIDE EFFECTS ----

  // When the app first loads, fetch all existing records from the DB.
  // The empty array [] means this only runs once (on mount).
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // ---- RENDER ----
  return (
    <div className="app-container">

      {/* ===== HEADER ===== */}
      <header className="app-header">
        <h1 className="app-logo">⛅ SkyWatch</h1>
        <p className="app-tagline">Real-time weather · Saved history · 5-day forecast</p>
      </header>

      {/* ===== SEARCH BAR ===== */}
      <SearchBar
        onSearch={searchWeather}
        onDetectLocation={detectLocation}
        loading={loading}
      />

      {/* ===== ERROR MESSAGE ===== */}
      {error && (
        <div className="error-banner" role="alert">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button className="error-close" onClick={clearError} aria-label="Dismiss error">
            ✕
          </button>
        </div>
      )}

      {/* ===== LOADING SPINNER ===== */}
      {loading && <LoadingSpinner message="Fetching weather data..." />}

      {/* ===== WEATHER RESULTS (only shown after a successful search) ===== */}
      {!loading && currentWeather && (
        <>
          {/* Current weather */}
          <WeatherCard data={currentWeather} />

          {/* 5-day forecast */}
          <Forecast
            forecast={
              // Prefer the forecast from the API response,
              // fall back to the stored raw_forecast from DB
              currentWeather.forecast ||
              currentWeather.raw_forecast ||
              []
            }
          />

          {/* Map */}
          <MapEmbed
            location={currentWeather.location}
            lat={currentWeather.lat}
            lon={currentWeather.lon}
          />

          {/* YouTube videos (only if returned) */}
          {videos.length > 0 && (
            <YouTubeSection
              videos={videos}
              location={currentWeather.location}
            />
          )}
        </>
      )}

      {/* ===== EXPORT BUTTONS ===== */}
      <ExportSection recordCount={records.length} />

      {/* ===== SEARCH HISTORY TABLE ===== */}
      <WeatherHistory
        records={records}
        onDelete={removeRecord}
        onEdit={editRecord}
        onLoadRecords={loadRecords}
      />

      <footer className="app-footer card">
        <p className="footer-name">Built by Sameer Shamrao Sukhadeve</p>
        <p className="footer-description">
          Product Manager Accelerator — A community helping aspiring and experienced PMs break into and grow in product management through mentorship, coaching, and real-world experience.
        </p>
      </footer>

    </div>
  );
}

export default App;
