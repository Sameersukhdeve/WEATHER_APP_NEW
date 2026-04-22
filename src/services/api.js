// ============================================================
// services/api.js
// ============================================================
// This file is the ONLY place where we talk to the backend.
// All components import functions from here — they never
// write axios calls directly. This makes it easy to change
// the backend URL in one place if needed.
// ============================================================

import axios from 'axios';

// Base URL — uses environment variable for production, falls back to proxy for development
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000, // 15 seconds before giving up
  headers: { 'Content-Type': 'application/json' }
});

// ============================================================
// WEATHER CRUD OPERATIONS
// ============================================================

/**
 * Fetch weather for a location and save it to the database.
 * @param {string} location - city name, zip code, coordinates, etc.
 * @param {string} dateStart - optional start date (YYYY-MM-DD)
 * @param {string} dateEnd   - optional end date (YYYY-MM-DD)
 */
export const createWeatherRecord = async (location, dateStart, dateEnd) => {
  const { data } = await API.post('/weather', {
    location,
    date_range_start: dateStart || undefined,
    date_range_end:   dateEnd   || undefined
  });
  return data;
};

/**
 * Get all saved weather records from the database.
 * @param {string} search - optional search term to filter by location
 */
export const getAllWeatherRecords = async (search = '') => {
  const { data } = await API.get('/weather', {
    params: search ? { search } : {}
  });
  return data;
};

/**
 * Get a single weather record by ID.
 * @param {number} id - the record's ID
 */
export const getWeatherRecord = async (id) => {
  const { data } = await API.get(`/weather/${id}`);
  return data;
};

/**
 * Update an existing weather record.
 * @param {number} id     - the record's ID
 * @param {object} fields - fields to update: { location, date_range_start, date_range_end }
 */
export const updateWeatherRecord = async (id, fields) => {
  const { data } = await API.put(`/weather/${id}`, fields);
  return data;
};

/**
 * Delete a weather record permanently.
 * @param {number} id - the record's ID
 */
export const deleteWeatherRecord = async (id) => {
  const { data } = await API.delete(`/weather/${id}`);
  return data;
};

// ============================================================
// EXPORT
// ============================================================

/**
 * Download weather records as a file.
 * @param {'json'|'csv'|'markdown'} format
 */
export const exportWeatherData = async (format) => {
  // Use window.open to trigger browser download
  window.open(`/api/weather/export/${format}`, '_blank');
};

export const getAirQuality = async (lat, lon) => {
  const { data } = await API.get(`/weather/airquality/${lat}/${lon}`);
  return data;
};

// ============================================================
// YOUTUBE VIDEOS
// ============================================================

/**
 * Get YouTube videos for a location.
 * @param {string} location
 */
export const getYouTubeVideos = async (location) => {
  const { data } = await API.get(`/weather/youtube/${encodeURIComponent(location)}`);
  return data;
};

// ============================================================
// ERROR HELPER
// Extracts a human-readable message from an API error
// ============================================================
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.join(' ');
  }
  if (error.message === 'Network Error') {
    return 'Cannot connect to the server. Make sure the backend is running.';
  }
  return error.message || 'Something went wrong. Please try again.';
};
