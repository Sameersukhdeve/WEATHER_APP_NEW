import axios from 'axios';

// ✅ FINAL BACKEND URL
const API = axios.create({
  baseURL: "https://weather-app-new-g4xu.onrender.com/api",
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});

// ================= WEATHER =================

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

// ================= EXPORT (FIXED) =================

export const exportWeatherData = (format) => {
  window.open(
    `https://weather-app-new-g4xu.onrender.com/api/weather/export/${format}`,
    '_blank'
  );
};

// ================= EXTRA =================

export const getAirQuality = async (lat, lon) => {
  const { data } = await API.get(`/weather/airquality/${lat}/${lon}`);
  return data;
};

export const getYouTubeVideos = async (location) => {
  const { data } = await API.get(`/weather/youtube/${encodeURIComponent(location)}`);
  return data;
};

// ================= ERROR =================

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message === 'Network Error') return 'Server not reachable';
  return error.message || 'Something went wrong';
};