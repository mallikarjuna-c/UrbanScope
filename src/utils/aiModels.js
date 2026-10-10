import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Check if backend is running
 */
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { status: 'offline', error: error.message };
  }
};

/**
 * Analyze heat risk for a city
 */
export const analyzeHeatRisk = async (city, coordinates, date = null) => {
  try {
    const response = await axios.post(`${API_BASE}/heat-risk`, {
      city,
      coordinates,
      date: date || new Date().toISOString().slice(0, 10)
    });
    return response.data;
  } catch (error) {
    console.error('Heat risk analysis failed:', error);
    throw error;
  }
};

/**
 * Analyze green space exposure
 */
export const analyzeGreenSpace = async (city, coordinates, bufferDistance = 500) => {
  try {
    const response = await axios.post(`${API_BASE}/green-space`, {
      city,
      coordinates,
      bufferDistance
    });
    return response.data;
  } catch (error) {
    console.error('Green space analysis failed:', error);
    throw error;
  }
};

/**
 * Analyze healthcare facility access
 */
export const analyzeHealthcare = async (city, coordinates, population = 1000000, driveTimeThreshold = 15) => {
  try {
    const response = await axios.post(`${API_BASE}/healthcare-access`, {
      city,
      coordinates,
      population,
      driveTimeThreshold
    });
    return response.data;
  } catch (error) {
    console.error('Healthcare analysis failed:', error);
    throw error;
  }
};

/**
 * Run integrated analysis (all 3 models)
 */
export const runIntegratedAnalysis = async (city, coordinates) => {
  try {
    const response = await axios.post(`${API_BASE}/integrated-analysis`, {
      city,
      coordinates
    });
    return response.data;
  } catch (error) {
    console.error('Integrated analysis failed:', error);
    throw error;
  }
};

/**
 * Predict future trends (5-year prediction)
 */
export const predictFutureTrends = async (city, coordinates, years = 5) => {
  try {
    const response = await axios.post(`${API_BASE}/predict-future`, {
      city,
      coordinates,
      years
    });
    return response.data;
  } catch (error) {
    console.error('Future prediction failed:', error);
    throw error;
  }
};

/**
 * City coordinates mapping
 */
export const CITY_COORDINATES = {
  'New York': [40.7128, -74.0060],
  'London': [51.5074, -0.1278],
  'Tokyo': [35.6762, 139.6503],
  'Delhi': [28.7041, 77.1025],
  'São Paulo': [-23.5505, -46.6333],
  'Mumbai': [19.0760, 72.8777],
  'Los Angeles': [34.0522, -118.2437],
  'Beijing': [39.9042, 116.4074]
};

/**
 * Get coordinates for a city
 */
export const getCityCoordinates = (cityName) => {
  return CITY_COORDINATES[cityName] || CITY_COORDINATES['Delhi'];
};

export default {
  checkBackendHealth,
  analyzeHeatRisk,
  analyzeGreenSpace,
  analyzeHealthcare,
  runIntegratedAnalysis,
  predictFutureTrends,
  getCityCoordinates,
  CITY_COORDINATES
};
