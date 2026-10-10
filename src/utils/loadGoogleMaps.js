// Loads the Google Maps JS API once, using the key from VITE_GOOGLE_MAPS_API_KEY.
let loadPromise = null;

export function loadGoogleMaps() {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google);
  }
  if (loadPromise) return loadPromise;

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!API_KEY) {
    return Promise.reject(new Error('Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file'));
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Google Maps. Please check your internet connection.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
