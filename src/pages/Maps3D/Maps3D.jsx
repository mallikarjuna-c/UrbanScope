import React, { useState, useEffect, useRef } from 'react';
import './Maps3D.css';
import { loadGoogleMaps } from '../../utils/loadGoogleMaps';

function Maps3D() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 28.6139, // Default: New Delhi
    lng: 77.2090,
    name: 'New Delhi, India'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  // Load Google Maps API
  useEffect(() => {
    loadGoogleMaps()
      .then(() => initializeMap())
      .catch((err) => setError(err.message));
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Initialize geocoder
    geocoderRef.current = new window.google.maps.Geocoder();

    // Initialize map with 3D view
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      zoom: 17,
      mapTypeId: 'satellite',
      tilt: 45, // 3D tilt
      heading: 0,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      rotateControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
      }
    });

    // Add initial marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      map: mapInstanceRef.current,
      title: selectedLocation.name,
      animation: window.google.maps.Animation.DROP
    });

    // Add click listener to map
    mapInstanceRef.current.addListener('click', (event) => {
      updateLocation(event.latLng.lat(), event.latLng.lng());
    });
  };

  const updateLocation = (lat, lng, name = 'Selected Location') => {
    if (!mapInstanceRef.current) return;

    // Update state
    setSelectedLocation({ lat, lng, name });

    // Update map center
    mapInstanceRef.current.setCenter({ lat, lng });

    // Update marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: name,
      animation: window.google.maps.Animation.DROP
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || !geocoderRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      geocoderRef.current.geocode({ address: searchQuery }, (results, status) => {
        setIsLoading(false);

        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const locationName = results[0].formatted_address;
          
          updateLocation(location.lat(), location.lng(), locationName);
        } else if (status === 'ZERO_RESULTS') {
          setError('Location not found. Please try a different search term.');
        } else {
          setError('Failed to search location. Please try again.');
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred while searching. Please try again.');
    }
  };

  const handleQuickLocation = (lat, lng, name) => {
    setSearchQuery(name);
    updateLocation(lat, lng, name);
  };

  const quickLocations = [
    { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
    { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
    { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 }
  ];

  return (
    <div className="maps-3d-page">
      <div className="maps-3d-header">
        <h1>🌍 3D Maps Viewer</h1>
        <p>Explore any location in stunning 3D aerial views powered by Google Maps</p>
      </div>

      {/* Search Section */}
      <div className="maps-search-section">
        <form onSubmit={handleSearch} className="maps-search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search for any city, landmark, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="maps-search-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={!searchQuery.trim() || isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {/* Quick Locations */}
        <div className="quick-locations">
          <h3>Quick Locations:</h3>
          <div className="quick-locations-grid">
            {quickLocations.map((loc, index) => (
              <button
                key={index}
                className="quick-location-btn"
                onClick={() => handleQuickLocation(loc.lat, loc.lng, loc.name)}
              >
                📍 {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Location Info */}
      <div className="current-location-info">
        <div className="location-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{selectedLocation.name}</span>
        </div>
        <div className="coordinates">
          Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
        </div>
      </div>

      {/* 3D Map Container */}
      <div className="maps-3d-container">
        <div ref={mapRef} className="google-maps-3d-viewer"></div>
        
        <div className="map-controls-info">
          <h4>🎮 Controls:</h4>
          <ul>
            <li><strong>Rotate:</strong> Hold Ctrl + Drag</li>
            <li><strong>Tilt:</strong> Hold Shift + Drag</li>
            <li><strong>Zoom:</strong> Scroll or +/- buttons</li>
            <li><strong>Click:</strong> Set new location</li>
          </ul>
        </div>
      </div>

      {/* Features Section */}
      <div className="maps-features">
        <div className="feature-card">
          <div className="feature-icon">🛰️</div>
          <h3>Satellite Imagery</h3>
          <p>High-resolution satellite views from Google Maps</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏙️</div>
          <h3>3D Buildings</h3>
          <p>Explore cities with realistic 3D building models</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Global Search</h3>
          <p>Search any location worldwide instantly</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>Street View</h3>
          <p>Ground-level panoramic views available</p>
        </div>
      </div>
    </div>
  );
}

export default Maps3D;
