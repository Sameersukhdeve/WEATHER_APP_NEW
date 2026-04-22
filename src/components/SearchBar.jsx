// ============================================================
// components/SearchBar.jsx
// ============================================================
// The search form at the top of the app.
// Features:
//   - Text input for location (city, zip, coordinates, etc.)
//   - Optional date range pickers
//   - "Detect my location" button using browser geolocation
//   - Submit button
// ============================================================

import React, { useState } from 'react';

const SearchBar = ({ onSearch, onDetectLocation, loading }) => {
  // Local state for the form fields
  const [location, setLocation]     = useState('');
  const [dateStart, setDateStart]   = useState('');
  const [dateEnd, setDateEnd]       = useState('');
  const [showDates, setShowDates]   = useState(false);

  // Called when the form is submitted
  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload

    const trimmed = location.trim();
    if (!trimmed) return; // don't submit if empty

    onSearch(trimmed, dateStart || undefined, dateEnd || undefined);
  };

  return (
    <div className="search-section card">
      <form className="search-form" onSubmit={handleSubmit}>

        {/* Main search row: text input + buttons */}
        <div className="search-row">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="City, zip code, coordinates (e.g. Tokyo, 10001, 28.61,77.20)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              disabled={loading}
              aria-label="Enter location"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !location.trim()}
          >
            {loading ? '⏳ Searching...' : '⚡ Get Weather'}
          </button>

          {/* Detect location button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onDetectLocation}
            disabled={loading}
            title="Use my current location"
          >
            📍 My Location
          </button>
        </div>

        {/* Toggle for date range section */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowDates(!showDates)}
          style={{ alignSelf: 'flex-start' }}
        >
          {showDates ? '▲ Hide' : '▼ Add'} date range (optional)
        </button>

        {/* Date range inputs — only shown when expanded */}
        {showDates && (
          <div className="search-date-row">
            <div className="date-group">
              <label className="date-label" htmlFor="date-start">Start date</label>
              <input
                id="date-start"
                type="date"
                className="date-input"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                max={dateEnd || undefined}
              />
            </div>
            <div className="date-group">
              <label className="date-label" htmlFor="date-end">End date</label>
              <input
                id="date-end"
                type="date"
                className="date-input"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                min={dateStart || undefined}
              />
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default SearchBar;
