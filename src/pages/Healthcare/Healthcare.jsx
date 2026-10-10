import React, { useState } from 'react';
import SatelliteMap from '../../components/SatelliteMap/SatelliteMap';
import GoogleMaps3D from '../../components/GoogleMaps3D/GoogleMaps3D';
import CitySearch from '../../components/CitySearch/CitySearch';
import { analyzeHealthcare } from '../../utils/aiModels';
import './Healthcare.css';

function Healthcare() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [population, setPopulation] = useState(1000000);
  const [driveTime, setDriveTime] = useState(15);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [healthcareResults, setHealthcareResults] = useState(null);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    // Auto-estimate population based on city (rough estimate)
    setPopulation(1000000);
    console.log('Selected city:', city);
  };

  const handleAnalyze = async () => {
    if (!selectedCity) {
      alert('Please search and select a city first');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await analyzeHealthcare(
        selectedCity.name,
        selectedCity.coordinates,
        population,
        driveTime
      );
      setHealthcareResults(response.data);
      setShowMap(true);
    } catch (error) {
      console.error('Healthcare analysis failed:', error);
      alert('Analysis failed. Make sure backend is running on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="healthcare-page">
      {/* Header */}
      <section className="healthcare-header">
        <div className="healthcare-header-content">
          <h1 className="healthcare-title">Healthcare Facility Access Analysis</h1>
          <p className="healthcare-subtitle">
            Advanced drive-time isoline analysis and population-based accessibility assessment using real-world data
          </p>
        </div>
      </section>


      {/* Analysis Controls */}
      <section className="analysis-section">
        <div className="container">
          <h2 className="section-title">Analysis Dashboard</h2>
          
          <div className="analysis-controls">
            <div className="control-group">
              <label>City Selection</label>
              <CitySearch onCitySelect={handleCitySelect} />
              {selectedCity && (
                <div className="selected-city-info">
                  <span>{selectedCity.name}, {selectedCity.country}</span>
                  <span className="coords">({selectedCity.lat.toFixed(4)}, {selectedCity.lon.toFixed(4)})</span>
                </div>
              )}
            </div>

            <div className="control-group">
              <label>Population</label>
              <input
                type="number"
                value={population}
                onChange={(e) => setPopulation(Number(e.target.value))}
                className="control-input"
                min="100000"
                step="100000"
              />
            </div>

            <div className="control-group">
              <label>Drive Time Threshold (minutes)</label>
              <select
                value={driveTime}
                onChange={(e) => setDriveTime(Number(e.target.value))}
                className="control-select"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (WHO)</option>
                <option value={20}>20 minutes</option>
              </select>
            </div>

            <button 
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading || !selectedCity}
            >
              {loading ? 'Analyzing...' : 'Analyze Healthcare Access'}
            </button>
          </div>

          {/* Results Display */}
          {healthcareResults && (
            <>
              {/* Overview Cards */}
              <div className="healthcare-overview">
                <div className="healthcare-card" style={{ borderColor: healthcareResults.statusColor }}>
                  <h3>Facilities</h3>
                  <div className="healthcare-value">{healthcareResults.facilitiesCount}</div>
                  <p className="healthcare-label">Total Healthcare Centers</p>
                </div>

                <div className="healthcare-card" style={{ borderColor: healthcareResults.statusColor }}>
                  <h3>Access Rate</h3>
                  <div className="healthcare-value">{healthcareResults.accessPercentage15min}%</div>
                  <p className="healthcare-label" style={{ color: healthcareResults.statusColor }}>
                    {healthcareResults.status}
                  </p>
                </div>

                <div className="healthcare-card" style={{ borderColor: healthcareResults.statusColor }}>
                  <h3>Population Served</h3>
                  <div className="healthcare-value">{(healthcareResults.populationWithAccess15min / 1000).toFixed(0)}K</div>
                  <p className="healthcare-label">Within {driveTime} minutes</p>
                </div>

                <div className="healthcare-card" style={{ borderColor: healthcareResults.statusColor }}>
                  <h3>Quality Score</h3>
                  <div className="healthcare-value">{healthcareResults.qualityScore}/100</div>
                  <p className="healthcare-label">Overall Quality</p>
                </div>
              </div>

              {/* 3D Aerial View */}
              <div className="visualization-section">
                <h3>3D Aerial View</h3>
                <GoogleMaps3D 
                  coordinates={selectedCity.coordinates}
                  city={selectedCity.name}
                />
                <p className="viz-description">
                  Google Maps 3D aerial view showing healthcare facilities and urban infrastructure.
                </p>
              </div>

              {/* Satellite Map */}
              {showMap && selectedCity && (
                <div className="map-section">
                  <h3>Healthcare Facility Distribution Map</h3>
                  <SatelliteMap 
                    city={selectedCity.name}
                    coordinates={selectedCity.coordinates}
                    dataset="heat"
                    date={new Date().toISOString().slice(0, 10)}
                  />
                  <p className="map-description">
                    Satellite view showing urban areas with hexagonal overlay for facility distribution analysis.
                  </p>
                </div>
              )}

              {/* Drive-Time Access Analysis */}
              <div className="drive-time-section">
                <h3>Drive-Time Access Analysis</h3>
                <div className="drive-time-grid">
                  <div className="drive-time-card">
                    <div className="time-badge">5 min</div>
                    <div className="access-percentage">{healthcareResults.accessPercentage5min}%</div>
                    <p className="access-count">{(healthcareResults.populationWithAccess5min / 1000).toFixed(0)}K people</p>
                    <p className="access-label">Immediate Access</p>
                  </div>
                  <div className="drive-time-card">
                    <div className="time-badge">10 min</div>
                    <div className="access-percentage">{healthcareResults.accessPercentage10min}%</div>
                    <p className="access-count">{(healthcareResults.populationWithAccess10min / 1000).toFixed(0)}K people</p>
                    <p className="access-label">Quick Access</p>
                  </div>
                  <div className="drive-time-card highlight">
                    <div className="time-badge">15 min</div>
                    <div className="access-percentage">{healthcareResults.accessPercentage15min}%</div>
                    <p className="access-count">{(healthcareResults.populationWithAccess15min / 1000).toFixed(0)}K people</p>
                    <p className="access-label">WHO Standard</p>
                  </div>
                </div>
              </div>

              {/* Facility Types */}
              <div className="facility-types-section">
                <h3>Facility Breakdown</h3>
                <div className="facility-grid">
                  <div className="facility-card">
                    <h4>Hospitals</h4>
                    <p className="facility-count">{healthcareResults.hospitals}</p>
                  </div>
                  <div className="facility-card">
                    <h4>Primary Care</h4>
                    <p className="facility-count">{healthcareResults.primaryCareCenters}</p>
                  </div>
                  <div className="facility-card">
                    <h4>Emergency Centers</h4>
                    <p className="facility-count">{healthcareResults.emergencyCenters}</p>
                  </div>
                  <div className="facility-card">
                    <h4>Specialists</h4>
                    <p className="facility-count">{healthcareResults.specialistsCount}</p>
                  </div>
                </div>
              </div>

              {/* Resource Metrics */}
              <div className="resource-metrics-section">
                <h3>Resource Metrics vs WHO Standards</h3>
                <div className="resource-grid">
                  <div className="resource-card">
                    <h4>Hospital Beds</h4>
                    <div className="resource-comparison">
                      <div className="current-value">
                        <span className="value-label">Current</span>
                        <span className="value-number">{healthcareResults.bedsPerThousand}</span>
                        <span className="value-unit">per 1,000</span>
                      </div>
                      <div className="comparison-arrow">→</div>
                      <div className="target-value">
                        <span className="value-label">WHO Target</span>
                        <span className="value-number">{healthcareResults.whoBedsPer1000}</span>
                        <span className="value-unit">per 1,000</span>
                      </div>
                    </div>
                    <div className="resource-gap">
                      <p>Gap: <strong>{healthcareResults.bedsGap}</strong> beds needed</p>
                    </div>
                  </div>

                  <div className="resource-card">
                    <h4>Doctors</h4>
                    <div className="resource-comparison">
                      <div className="current-value">
                        <span className="value-label">Current</span>
                        <span className="value-number">{healthcareResults.doctorsPerThousand}</span>
                        <span className="value-unit">per 1,000</span>
                      </div>
                      <div className="comparison-arrow">→</div>
                      <div className="target-value">
                        <span className="value-label">WHO Target</span>
                        <span className="value-number">{healthcareResults.whoDoctorsPer1000}</span>
                        <span className="value-unit">per 1,000</span>
                      </div>
                    </div>
                    <div className="resource-gap">
                      <p>Gap: <strong>{healthcareResults.doctorsGap}</strong> doctors needed</p>
                    </div>
                  </div>

                  <div className="resource-card">
                    <h4>Facilities</h4>
                    <div className="resource-comparison">
                      <div className="current-value">
                        <span className="value-label">Current</span>
                        <span className="value-number">{healthcareResults.facilitiesPer100k}</span>
                        <span className="value-unit">per 100K</span>
                      </div>
                      <div className="comparison-arrow">→</div>
                      <div className="target-value">
                        <span className="value-label">WHO Target</span>
                        <span className="value-number">{healthcareResults.whoFacilitiesPer100k}</span>
                        <span className="value-unit">per 100K</span>
                      </div>
                    </div>
                    <div className="resource-gap">
                      <p>Gap: <strong>{healthcareResults.facilitiesGap}</strong> facilities needed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Underserved Areas */}
              {healthcareResults.underservedAreas && healthcareResults.underservedAreas.length > 0 && (
                <div className="underserved-section">
                  <h3>Underserved Areas</h3>
                  <div className="underserved-list">
                    {healthcareResults.underservedAreas.map((area, index) => (
                      <div key={index} className="underserved-item">
                        <span className="area-name">{area}</span>
                        <span className="priority-badge">High Priority</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Locations */}
              {healthcareResults.recommendedLocations && healthcareResults.recommendedLocations.length > 0 && (
                <div className="recommended-locations-section">
                  <h3>📍 Recommended New Facility Locations</h3>
                  <div className="locations-grid">
                    {healthcareResults.recommendedLocations.map((location, index) => (
                      <div key={index} className="location-card">
                        <div className="location-header">
                          <span className="location-number">#{index + 1}</span>
                          <span className={`priority-badge ${location.priority.toLowerCase()}`}>
                            {location.priority}
                          </span>
                        </div>
                        <div className="location-details">
                          <p><strong>Type:</strong> {location.recommendedType}</p>
                          <p><strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
                          <p><strong>Est. Population Served:</strong> {location.estimatedServedPopulation.toLocaleString()}</p>
                          <p><strong>Est. Cost:</strong> {location.estimatedCost}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Metrics */}
              <div className="quality-metrics-section">
                <h3>⭐ Quality Metrics</h3>
                <div className="quality-grid">
                  <div className="quality-item">
                    <span className="quality-label">Average Wait Time</span>
                    <span className="quality-value">{healthcareResults.avgWaitTime} min</span>
                  </div>
                  <div className="quality-item">
                    <span className="quality-label">Total Beds</span>
                    <span className="quality-value">{healthcareResults.totalBeds.toLocaleString()}</span>
                  </div>
                  <div className="quality-item">
                    <span className="quality-label">Total Doctors</span>
                    <span className="quality-value">{healthcareResults.totalDoctors.toLocaleString()}</span>
                  </div>
                  <div className="quality-item">
                    <span className="quality-label">Total Nurses</span>
                    <span className="quality-value">{healthcareResults.totalNurses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="recommendations-section">
                <h3>Recommendations</h3>
                <div className="recommendations-list">
                  {healthcareResults.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <span className="rec-number">{index + 1}</span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <div className="data-source-section">
                <h3>Data Sources</h3>
                <p className="data-source-text">{healthcareResults.dataSource}</p>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  );
}

export default Healthcare;
