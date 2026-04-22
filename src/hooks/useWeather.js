// ============================================================
// hooks/useWeather.js
// ============================================================
// A custom React Hook that manages all weather-related state
// and side effects. Components use this hook to get data and
// trigger actions — they don't need to know the details.
//
// Think of a hook as a "bundle of logic" you can reuse
// across multiple components.
// ============================================================

import { useState, useCallback } from 'react';
import {
  createWeatherRecord,
  getAllWeatherRecords,
  deleteWeatherRecord,
  updateWeatherRecord,
  getYouTubeVideos,
  getAirQuality,
  getErrorMessage
} from '../services/api';

const useWeather = () => {
  // ---- STATE ------------------------------------------------
  // currentWeather: the weather data currently being displayed
  const [currentWeather, setCurrentWeather] = useState(null);

  // records: the list of saved weather records from the database
  const [records, setRecords] = useState([]);

  // loading: true while an API call is in progress
  const [loading, setLoading] = useState(false);

  // error: error message string, or null if no error
  const [error, setError] = useState(null);

  // videos: YouTube videos for the searched location
  const [videos, setVideos] = useState([]);

  // ---- ACTIONS ----------------------------------------------

  /**
   * Search for weather and save to DB.
   * Called when user submits the search form.
   */
  const searchWeather = useCallback(async (location, dateStart, dateEnd) => {
    setLoading(true);
    setError(null);
    setVideos([]);

    try {
      const result = await createWeatherRecord(location, dateStart, dateEnd);

      if (result.success) {
        let weatherData = result.data;

        // Fetch air quality from OpenWeatherMap using the returned coordinates.
        if (weatherData.lat && weatherData.lon) {
          try {
            const airData = await getAirQuality(weatherData.lat, weatherData.lon);
            if (airData.success) {
              weatherData = { ...weatherData, aqi: airData.aqi, aqi_label: airData.label };
            }
          } catch (airError) {
            weatherData = { ...weatherData, aqi: null, aqi_label: 'Unavailable' };
          }
        }

        setCurrentWeather(weatherData);

        // Also refresh the records list to include this new entry
        const allRecords = await getAllWeatherRecords();
        if (allRecords.success) setRecords(allRecords.data);

        // Fetch YouTube videos in background (don't block weather display)
        getYouTubeVideos(result.data.location)
          .then(ytData => { if (ytData.success) setVideos(ytData.videos); })
          .catch(() => {}); // fail silently
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load all saved records from the database.
   * Called on page load and after changes.
   */
  const loadRecords = useCallback(async (search = '') => {
    try {
      const result = await getAllWeatherRecords(search);
      if (result.success) setRecords(result.data);
    } catch (err) {
      console.error('Failed to load records:', err);
    }
  }, []);

  /**
   * Delete a record by ID.
   */
  const removeRecord = useCallback(async (id) => {
    try {
      await deleteWeatherRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      // If the deleted record is currently displayed, clear it
      setCurrentWeather(prev =>
        prev && prev.id === id ? null : prev
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  /**
   * Update a record's location or date range.
   */
  const editRecord = useCallback(async (id, fields) => {
    try {
      const result = await updateWeatherRecord(id, fields);
      if (result.success) {
        setRecords(prev =>
          prev.map(r => r.id === id ? result.data : r)
        );
        // Update current display if this record is shown
        setCurrentWeather(prev =>
          prev && prev.id === id ? result.data : prev
        );
      }
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }, []);

  /**
   * Use geolocation to get user's current position,
   * then search weather for those coordinates.
   */
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // OpenWeatherMap accepts "lat,lon" format
        await searchWeather(`${latitude},${longitude}`);
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === 1
            ? 'Location permission denied. Please allow location access and try again.'
            : 'Could not detect your location. Please type it manually.'
        );
      }
    );
  }, [searchWeather]);

  /**
   * Clear the current error message.
   */
  const clearError = useCallback(() => setError(null), []);

  return {
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
  };
};

export default useWeather;
