// ============================================================
// components/LoadingSpinner.jsx
// ============================================================
// A simple animated spinner shown while API calls are loading.
// ============================================================

import React from 'react';

const LoadingSpinner = ({ message = 'Fetching weather data...' }) => {
  return (
    <div className="loading-overlay" role="status" aria-label="Loading">
      <div className="spinner" aria-hidden="true" />
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
