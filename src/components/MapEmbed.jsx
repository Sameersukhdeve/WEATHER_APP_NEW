// ============================================================
// components/MapEmbed.jsx
// ============================================================
// Embeds a Google Map centered on the searched location.
// Shows a static map if Google Maps API key is not configured.
// ============================================================

import React from 'react';

const MapEmbed = ({ location, lat, lon }) => {
  if (!location) return null;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Build the map URL
  // If we have an API key, use Google Maps Embed API
  // Otherwise, use OpenStreetMap as a free fallback
  let mapSrc;

  if (apiKey && apiKey !== 'your_google_maps_api_key_here') {
    // Google Maps Embed API
    const query = lat && lon
      ? `${lat},${lon}`
      : encodeURIComponent(location);
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=11`;
  } else {
    // ✅ OpenStreetMap - completely free, no API key needed
    // Uses the iframe embed format
    if (lat && lon) {
      mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.1},${lat-0.1},${lon+0.1},${lat+0.1}&layer=mapnik&marker=${lat},${lon}`;
    } else {
      // Search by name using Nominatim
      mapSrc = `https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(location)}&layer=mapnik`;
    }
  }

  return (
    <div className="map-section card">
      <p className="section-title">🗺️ Location Map</p>
      <iframe
        src={mapSrc}
        className="map-frame"
        title={`Map of ${location}`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p style={{
        fontSize: '0.65rem',
        color: 'var(--text-muted)',
        marginTop: '8px',
        fontFamily: 'var(--font-mono)'
      }}>
        📍 {location} {lat && lon ? `(${lat.toFixed(2)}, ${lon.toFixed(2)})` : ''}
      </p>
    </div>
  );
};

export default MapEmbed;
