/**
 * Geocoding Utility
 * Search for any city worldwide using OpenStreetMap Nominatim API
 * Free, no API key required!
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search for cities by name
 * Returns list of matching cities with coordinates
 */
export const searchCities = async (query) => {
  if (!query || query.length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: 1,
      limit: 10,
      featuretype: 'city',
      'accept-language': 'en'
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'UrbanScope-NASA-SpaceApps/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    // Filter and format results
    return data
      .filter(item => {
        // Only include cities, towns, villages
        const type = item.type;
        const addressType = item.address?.city || item.address?.town || item.address?.village;
        return addressType || ['city', 'town', 'administrative'].includes(type);
      })
      .map(item => ({
        name: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village || item.name,
        country: item.address?.country || '',
        countryCode: item.address?.country_code?.toUpperCase() || '',
        state: item.address?.state || '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        bbox: item.boundingbox,
        displayName: formatDisplayName(item)
      }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

/**
 * Format display name for city
 */
const formatDisplayName = (item) => {
  const city = item.address?.city || item.address?.town || item.address?.village || item.name;
  const state = item.address?.state;
  const country = item.address?.country;

  let parts = [city];
  if (state && state !== city) parts.push(state);
  if (country) parts.push(country);

  return parts.join(', ');
};

/**
 * Reverse geocode - get city name from coordinates
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const params = new URLSearchParams({
      lat: lat,
      lon: lon,
      format: 'json',
      addressdetails: 1,
      zoom: 10
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': 'UrbanScope-NASA-SpaceApps/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    return {
      city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
      country: data.address?.country || '',
      state: data.address?.state || '',
      displayName: data.display_name
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Get city details by name
 */
export const getCityDetails = async (cityName) => {
  const results = await searchCities(cityName);
  return results.length > 0 ? results[0] : null;
};

/**
 * Validate coordinates
 */
export const validateCoordinates = (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
};

/**
 * Calculate distance between two coordinates (in km)
 * Using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get popular cities (fallback/suggestions)
 */
export const getPopularCities = () => {
  return [
    { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, flag: '🇺🇸' },
    { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, flag: '🇬🇧' },
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, flag: '🇯🇵' },
    { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, flag: '🇮🇳' },
    { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, flag: '🇧🇷' },
    { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, flag: '🇮🇳' },
    { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, flag: '🇫🇷' },
    { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, flag: '🇩🇪' },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, flag: '🇦🇺' },
    { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, flag: '🇦🇪' },
    { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, flag: '🇸🇬' },
    { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, flag: '🇨🇦' },
    { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, flag: '🇲🇽' },
    { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, flag: '🇪🇬' },
    { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, flag: '🇳🇬' },
    { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, flag: '🇨🇳' },
    { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, flag: '🇰🇷' },
    { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, flag: '🇹🇷' },
    { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, flag: '🇹🇭' },
    { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437, flag: '🇺🇸' }
  ];
};

/**
 * Get country flag emoji from country code
 */
export const getCountryFlag = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  
  return String.fromCodePoint(...codePoints);
};

/**
 * Debounce function for search input
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default {
  searchCities,
  reverseGeocode,
  getCityDetails,
  validateCoordinates,
  calculateDistance,
  getPopularCities,
  getCountryFlag,
  debounce
};
