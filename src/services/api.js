import axios from 'axios';

// ✅ FINAL BACKEND URL (WITH /api PREFIX)
const API = axios.create({
  baseURL: "https://weather-app-new-g4xu.onrender.com/api",
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// ============================================================
// WEATHER CRUD OPERATIONS
// ============================================================

export const createWeatherRecord = async (location, dateStart, dateEnd) => {
  const { data } = await API.post('/weather', {
    location,
    date_range_start: dateStart || undefined,
    date_range_end: dateEnd || undefined
  });
  return data;
};

export const getAllWeatherRecords = async (search = '') => {
  const { data } = await API.get('/weather', {
    params: search ? { search } : {}
  });
  return data;
};

export const getWeatherRecord = async (id) => {
  const { data } = await API.get(`/weather/${id}`);
  return data;
};

export const updateWeatherRecord = async (id, fields) => {
  const { data } = await API.put(`/weather/${id}`, fields);
  return data;
};

export const deleteWeatherRecord = async (id) => {
  const { data } = await API.delete(`/weather/${id}`);
  return data;
};

// ============================================================
// EXPORT (✅ FIXED)
// ============================================================

export const exportWeatherData = async (format) => {
  window.open(
    `https://weather-app-new-g4xu.onrender.com/api/weather/export/${format}`,
    '_blank'
  );
};

// ============================================================
// EXTRA APIs
// ============================================================

export const getAirQuality = async (lat, lon) => {
  const { data } = await API.get(`/weather/airquality/${lat}/${lon}`);
  return data;
};

export const getYouTubeVideos = async (location) => {
  const { data } = await API.get(
    `/weather/youtube/${encodeURIComponent(location)}`
  );
  return data;
};

// ============================================================
// ERROR HELPER
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