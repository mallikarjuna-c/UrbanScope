import React, { useState, useEffect, useRef } from 'react';
import { searchCities, getPopularCities, debounce } from '../../utils/geocoding';
import './CitySearch.css';

function CitySearch({ onCitySelect, placeholder = "Search for any city worldwide..." }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const searchRef = useRef(null);

  const popularCities = getPopularCities();

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = await searchCities(query);
      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 500)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setShowPopular(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowPopular(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.length === 0) {
      setShowPopular(true);
    } else if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleCitySelect = (city) => {
    setSearchQuery(city.displayName || `${city.name}, ${city.country}`);
    setShowResults(false);
    setShowPopular(false);
    
    onCitySelect({
      name: city.city || city.name,
      country: city.country,
      coordinates: [city.lat, city.lon],
      lat: city.lat,
      lon: city.lon
    });
  };

  const handlePopularCitySelect = (city) => {
    setSearchQuery(`${city.name}, ${city.country}`);
    setShowPopular(false);
    
    onCitySelect({
      name: city.name,
      country: city.country,
      coordinates: [city.lat, city.lon],
      lat: city.lat,
      lon: city.lon
    });
  };

  return (
    <div className="city-search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="city-search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        {isSearching && <span className="search-loading">⏳</span>}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="search-results-dropdown">
          <div className="dropdown-header">
            <span>🌍 Search Results</span>
            <span className="results-count">{searchResults.length} found</span>
          </div>
          {searchResults.map((city, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => handleCitySelect(city)}
            >
              <div className="result-icon">📍</div>
              <div className="result-info">
                <div className="result-name">{city.city}</div>
                <div className="result-details">
                  {city.state && <span>{city.state}, </span>}
                  <span>{city.country}</span>
                </div>
              </div>
              <div className="result-coords">
                {city.lat.toFixed(4)}, {city.lon.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popular Cities Dropdown */}
      {showPopular && (
        <div className="search-results-dropdown popular-cities">
          <div className="dropdown-header">
            <span>⭐ Popular Cities</span>
          </div>
          <div className="popular-cities-grid">
            {popularCities.map((city, index) => (
              <div
                key={index}
                className="popular-city-item"
                onClick={() => handlePopularCitySelect(city)}
              >
                <span className="city-flag">{city.flag}</span>
                <div className="city-info">
                  <div className="city-name">{city.name}</div>
                  <div className="city-country">{city.country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && !isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
        <div className="search-results-dropdown">
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <p>No cities found for "{searchQuery}"</p>
            <small>Try searching for a different city name</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default CitySearch;
